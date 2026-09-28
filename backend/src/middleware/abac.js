import { defineAbility } from '@casl/ability'

export function defineRulesFor(user) {
  return defineAbility((can, cannot) => {
    if (!user) return

    if (user.role === 'admin' || user.role === 'super_admin') {
      can('manage', 'all')
      return
    }

    if (user.role === 'student') {
      can('read', 'Document', { owner_id: user.id })
      can('create', 'Document', { owner_id: user.id })
      can('delete', 'Document', { owner_id: user.id })
      // more student rules could go here
    }

    if (user.role === 'editor') {
      can('read', 'all')
      can('update', 'Program')
      can('update', 'Event')
      // editor shouldn't arbitrarily read sensitive student documents unless assigned
      cannot('read', 'Document')
    }
  })
}

// Middleware
export function checkAbility(action, subject) {
  return (req, res, next) => {
    const ability = defineRulesFor(req.user)
    
    // We attach it to req for potential dynamic checks inside the controller (e.g. comparing owner_id)
    req.ability = ability

    // For static subjects (e.g. 'Program', 'Event')
    if (typeof subject === 'string') {
      if (ability.can(action, subject)) {
        return next()
      } else {
        return res.status(403).json({ error: { message: 'Forbidden' } })
      }
    }
    
    // For dynamic checks, the controller must manually assert: req.ability.can(action, subjectObject)
    next()
  }
}
