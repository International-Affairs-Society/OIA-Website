import prisma from '../lib/prisma.js'

export const getDrafts = async (req, res, next) => {
  try {
    const userId = req.user.id
    const drafts = await prisma.drafts.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' }
    })
    res.json({ data: drafts })
  } catch (error) {
    next(error)
  }
}

export const createOrUpdateDraft = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id, type, title, data } = req.body

    let draft;
    if (id) {
      const existingDraft = await prisma.drafts.findUnique({ where: { id } })
      if (!existingDraft) {
        return res.status(404).json({ error: { message: 'Draft not found' } })
      }
      if (existingDraft.user_id !== userId) {
         return res.status(403).json({ error: { message: 'Unauthorized to update this draft' } })
      }

      draft = await prisma.drafts.update({
        where: { id },
        data: {
          type,
          title,
          data,
          updated_at: new Date()
        }
      })
    } else {
      draft = await prisma.drafts.create({
        data: {
          type,
          title,
          data,
          user_id: userId
        }
      })
    }
    res.status(200).json({ data: draft })
  } catch (error) {
    next(error)
  }
}

export const deleteDraft = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const draft = await prisma.drafts.findUnique({ where: { id } })
    if (!draft) {
      return res.status(404).json({ error: { message: 'Draft not found' } })
    }

    if (draft.user_id !== userId) {
      return res.status(403).json({ error: { message: 'Unauthorized to delete this draft' } })
    }

    await prisma.drafts.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
