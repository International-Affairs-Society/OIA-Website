import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import supabaseSingleton from '../lib/supabase.js'

export async function authenticate(req, res, next) {
  try {
    // Check for token in cookies first, then authorization header
    let token = req.cookies?.access_token
    
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }

    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'No session token provided' }
      })
    }

    // Verify token locally first (zero network roundtrips)
    let authUser
    try {
      const decodedToken = jwt.verify(token, process.env.SUPABASE_JWT_SECRET)
      authUser = {
        id: decodedToken.sub,
        email: decodedToken.email,
        user_metadata: decodedToken.user_metadata || {}
      }
    } catch (err) {
      console.log('[Auth] Local JWT verify failed:', err.message, '- falling back to Supabase API')
      // Fallback: verification with Supabase API if local fails
      const { data: { user: supabaseUser }, error: supabaseError } = await supabaseSingleton.auth.getUser(token)
      if (supabaseError || !supabaseUser) {
        console.log('[Auth] Supabase API fallback failed:', supabaseError)
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session token' }
        })
      }
      authUser = supabaseUser
    }

    // Domain check — defence in depth
    if (!authUser.email?.endsWith('@bennett.edu.in')) {
      console.log('[Auth] Unauthorized email domain:', authUser.email)
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Unauthorized email domain' }
      })
    }

    const decoded = {
      sub: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split('@')[0]
    }

    const isStudent = /^[a-z]\d{2}[a-z]+\d+@bennett\.edu\.in$/i.test(decoded.email)
    const assignedRole = isStudent ? 'student' : 'general'
    const displayName = decoded.name || decoded.preferred_username || decoded.email.split('@')[0]
    const enrollmentNo = decoded.email.split('@')[0].toLowerCase()

    console.log(`[Auth] Provisioning user: ${decoded.email}, role: ${assignedRole}`)

    // Upsert by email — handles cases where auth UUID changes (e.g. after schema resets)
    const appUser = await prisma.users.upsert({
      where: { email: decoded.email.toLowerCase() },
      update: { id: decoded.sub, name: displayName },
      create: {
        id: decoded.sub,
        email: decoded.email.toLowerCase(),
        name: displayName,
        role: assignedRole
      },
      include: {
        students: true
      }
    })

    // JIT: ensure students row exists and enrollment_no is up-to-date for student accounts
    if (isStudent) {
      const studentRecord = await prisma.students.upsert({
        where: { user_id: appUser.id },
        update: { enrollment_no: enrollmentNo },
        create: { user_id: appUser.id, enrollment_no: enrollmentNo }
      })
      appUser.students = studentRecord
    }

    req.user = appUser
    next()
  } catch (err) {
    console.error('[Auth] Middleware error:', err)
    next(err)
  }
}
