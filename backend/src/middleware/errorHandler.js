import { ZodError } from 'zod'

export default function errorHandler(err, req, res, next) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    console.error('Zod validation failed:', err)
    const fields = {}
    const issues = err.issues || err.errors || []
    issues.forEach((issue) => {
      const path = issue.path.join('.')
      fields[path] = issue.message
    })
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        fields
      }
    })
  }

  // Handle other error structures
  const status = err.status || 500
  const code = err.code || 'INTERNAL_ERROR'
  const message = err.message || 'Something went wrong'

  if (status >= 500) {
    console.error('Unhandled internal server error:', err)
  }

  const responseError = {
    code,
    message
  }

  if (err.fields) {
    responseError.fields = err.fields
  }

  return res.status(status).json({
    error: responseError
  })
}
