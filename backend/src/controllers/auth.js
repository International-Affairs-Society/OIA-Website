import asyncHandler from '../middleware/asyncHandler.js'

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user
  res.json({
    id: user.id,
    email: user.email,
    display_name: user.name,
    role: user.role,
    gender: user.gender || null,
    phone_number: user.phone_number || null,
    photo_url: user.photo_url || null,
    school: user.students?.school || null,
    course: user.students?.course || null,
    enrollment_no: user.students?.enrollment_no || null,
    created_at: user.created_at,
    updated_at: user.updated_at
  })
})

export const setCookie = asyncHandler(async (req, res) => {
  const { access_token, refresh_token } = req.body

  if (!access_token) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'access_token is required' } })
  }

  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 3600000 // 1 hour
  })

  if (refresh_token) {
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 30 * 24 * 3600000 // 30 days
    })
  }

  res.json({ message: 'Session cookies set successfully' })
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('access_token')
  res.clearCookie('refresh_token')
  res.json({ message: 'Logged out successfully' })
})
