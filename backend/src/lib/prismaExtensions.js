export const softDeleteAndAuditExtension = {
  name: 'softDeleteAndAudit',
  model: {
    $allModels: {
      async softDelete({ where, performedBy }) {
        const ctx = this
        const modelName = ctx.name
        
        // Find existing record to record its name/title for audit
        const record = await ctx.findUnique({ where })
        if (!record) throw new Error('Record not found')

        // Attempt soft-delete if deleted_at exists on model, otherwise hard delete (or throw)
        // Since we explicitly added deleted_at to critical models, we assume it's there
        const updated = await ctx.update({
          where,
          data: {
            deleted_at: new Date()
          }
        })

        // Add audit log
        // Assuming prisma client is in context, but to avoid circular import, we can return the transaction operations
        // Or if we need to write it directly, we can use a separate prisma instance or the global one
        return { updated, record, modelName }
      }
    }
  },
  query: {
    $allModels: {
      async delete({ model, operation, args, query }) {
        if (!args.data) args.data = {}
        args.data.deleted_at = new Date()
        return query({ ...args, operation: 'update' })
      },
      async deleteMany({ model, operation, args, query }) {
        if (!args.data) args.data = {}
        args.data.deleted_at = new Date()
        return query({ ...args, operation: 'updateMany' })
      },
      // Exclude deleted records from queries by default
      async findMany({ model, operation, args, query }) {
        if (['programs', 'events', 'mous', 'applications', 'visits', 'documents'].includes(model)) {
          args.where = { ...args.where, deleted_at: null }
        }
        return query(args)
      },
      async findFirst({ model, operation, args, query }) {
        if (['programs', 'events', 'mous', 'applications', 'visits', 'documents'].includes(model)) {
          args.where = { ...args.where, deleted_at: null }
        }
        return query(args)
      }
    }
  }
}
