import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import pick from '../utils/pick.js'
import { paginate } from '../utils/paginate.js'

// Validation Schema for user update
const userUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  mobile: z.string().optional(),
  photoUrl: z.string().url().or(z.string().nullable()).optional(),
  role: z.enum(['super_admin', 'admin', 'editor', 'viewer', 'student', 'general']).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  school: z.string().optional(),
  course: z.string().optional()
})

// Helper to format database user to API user response
function formatUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    displayName: user.name || '',
    role: user.role,
    mobile: user.phone_number || '',
    gender: user.gender || null,
    photoUrl: user.photo_url || null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    student: user.students ? {
      id: user.students.id,
      school: user.students.school || '',
      course: user.students.course || '',
      enrollmentNo: user.students.enrollment_no,
      program: user.students.applications?.[0]?.program?.name || 'None'
    } : null
  }
}

// GET /users (STAFF, LEADERSHIP only)
export const getUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query

  const where = {}

  if (role) {
    if (role.includes(',')) {
      where.role = {
        in: role.split(',').map(r => r.trim().toLowerCase())
      }
    } else {
      where.role = role.toLowerCase()
    }
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } }
    ]
  }

  const paginatedResult = await paginate(prisma.users, req.query, {
    where,
    include: {
      students: {
        include: {
          applications: {
            include: {
              program: true
            },
            orderBy: { submitted_at: 'desc' },
            take: 1
          }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  res.json({
    data: paginatedResult.data.map(formatUser),
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /users/:id (STAFF, LEADERSHIP, or Self)
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Check permissions: must be admin, super_admin or self
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.id !== id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    })
  }

  const user = await prisma.users.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          applications: {
            include: {
              program: true
            },
            orderBy: { submitted_at: 'desc' },
            take: 1
          }
        }
      }
    }
  })

  if (!user) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'User not found' }
    })
  }

  res.json(formatUser(user))
})

// POST /users (SUPER_ADMIN only)
export const createUser = asyncHandler(async (req, res) => {
  // Only super_admin can create users
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Only super admins can create users' }
    })
  }

  const { name, email, role, phoneNumber, department, gender, photoUrl, school, course } = req.body

  if (!email || !role) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Email and role are required' }
    })
  }

  // Check if user already exists
  const existingUser = await prisma.users.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (existingUser) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'User with this email already exists' }
    })
  }

  const roleValue = role.toLowerCase()
  if (roleValue === 'super_admin') {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Only developers can assign the super_admin role.' }
    })
  }

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone_number: phoneNumber,
        gender: gender || null,
        photo_url: photoUrl || null,
        role: roleValue
      }
    })

    if (roleValue === 'student') {
      // Derive enrollment_no from email prefix (e.g. s25cseu2042@bennett.edu.in → s25cseu2042)
      const enrollmentNo = email.split('@')[0].toLowerCase()
      await tx.students.create({
        data: {
          user_id: user.id,
          enrollment_no: enrollmentNo,
          school: school || department || null,
          course: course || department || null
        }
      })
    }

    return user
  })

  // Re-fetch to include students relation if created
  const createdUser = await prisma.users.findUnique({
    where: { id: newUser.id },
    include: {
      students: {
        include: {
          applications: {
            include: {
              program: true
            },
            orderBy: { submitted_at: 'desc' },
            take: 1
          }
        }
      }
    }
  })

  res.status(201).json(formatUser(createdUser))
})

// PATCH /users/:id (SUPER_ADMIN or Self)
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Check permissions: must be super_admin or self
  if (req.user.role !== 'super_admin' && req.user.id !== id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    })
  }

  // Parse request body
  const parsedBody = userUpdateSchema.parse(req.body)

  // Explicit role-based field allow-list
  const allowedKeys = ['displayName', 'mobile', 'photoUrl', 'gender', 'school', 'course']
  
  // Rule: role updates allowed by super_admin only
  if (req.user.role === 'super_admin') {
    allowedKeys.push('role')
  }

  const updateFields = pick(parsedBody, allowedKeys)

  // Map camelCase request fields to database snake_case columns
  const dbFields = {}
  if (updateFields.displayName !== undefined) dbFields.name = updateFields.displayName
  if (updateFields.mobile !== undefined) dbFields.phone_number = updateFields.mobile
  if (updateFields.role !== undefined) {
    const roleValue = updateFields.role.toLowerCase()
    if (roleValue === 'super_admin') {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Only developers can assign the super_admin role.' }
      })
    }
    dbFields.role = roleValue
  }
  if (updateFields.gender !== undefined) dbFields.gender = updateFields.gender
  if (updateFields.photoUrl !== undefined) dbFields.photo_url = updateFields.photoUrl

  dbFields.updated_at = new Date()

  const studentFields = {}
  if (updateFields.school !== undefined) studentFields.school = updateFields.school
  if (updateFields.course !== undefined) studentFields.course = updateFields.course

  const hasStudentFields = Object.keys(studentFields).length > 0

  if (hasStudentFields) {
    const existingUser = await prisma.users.findUnique({
      where: { id },
      include: { students: true }
    })
    
    if (existingUser) {
      if (existingUser.students) {
        dbFields.students = {
          update: studentFields
        }
      } else {
        // Upsert student record if it doesn't exist
        const enrollmentNo = existingUser.email.split('@')[0].toLowerCase();
        dbFields.students = {
          create: {
            enrollment_no: enrollmentNo,
            ...studentFields
          }
        }
      }
    }
  }

  const updatedUser = await prisma.users.update({
    where: { id },
    data: dbFields,
    include: {
      students: {
        include: {
          applications: {
            include: {
              program: true
            },
            orderBy: { submitted_at: 'desc' },
            take: 1
          }
        }
      }
    }
  })

  res.json(formatUser(updatedUser))
})

// DELETE /users/:id (SUPER_ADMIN only)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Only super_admin can delete users
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Only super admins can delete users' }
    })
  }

  // Check if user exists
  const user = await prisma.users.findUnique({
    where: { id }
  })

  if (!user) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'User not found' }
    })
  }

  // Hard delete: Since there's no soft delete and relationships are restricted,
  // we must cascade the delete manually in a transaction.
  await prisma.$transaction(async (tx) => {
    // 1. Delete stage history records created by or belonging to this user's applications
    await tx.stage_history.deleteMany({
      where: {
        OR: [
          { changed_by_id: id },
          { applications: { student: { user_id: id } } }
        ]
      }
    })

    // 2. Delete documents owned by or verified by this user
    await tx.documents.deleteMany({
      where: {
        OR: [
          { user_id: id },
          { verified_by_id: id }
        ]
      }
    })

    // 3. Delete applications
    await tx.applications.deleteMany({
      where: { student: { user_id: id } }
    })

    // 4. Delete student records (FIXED: was student_records)
    await tx.students.deleteMany({
      where: { user_id: id }
    })

    // 5. Unlink from notifications sent by this user
    await tx.notifications.updateMany({
      where: { sent_by_id: id },
      data: { sent_by_id: null }
    })

    // 6. Delete or unlink from change requests
    await tx.change_requests.deleteMany({
      where: { requested_by: id }
    })
    await tx.change_requests.updateMany({
      where: { reviewed_by: id },
      data: { reviewed_by: null }
    })

    // 7. Finally, delete the user
    await tx.users.delete({
      where: { id }
    })
  })

  res.json({ message: 'User deleted successfully' })
})
