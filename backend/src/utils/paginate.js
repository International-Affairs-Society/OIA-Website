/**
 * Paginates a Prisma model query.
 * @param {Object} prismaModel - The Prisma model delegate (e.g. prisma.users).
 * @param {Object} queryParams - Express request query params (req.query).
 * @param {Object} findManyArgs - Extra arguments to pass to findMany (where, select, include, orderBy, etc.).
 * @returns {Promise<Object>} Returns pagination result object.
 */
export async function paginate(prismaModel, queryParams, findManyArgs = {}) {
  const page = Math.max(1, parseInt(queryParams.page) || 1)
  const limit = Math.max(1, parseInt(queryParams.limit) || 20)
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    prismaModel.findMany({
      ...findManyArgs,
      skip,
      take: limit
    }),
    prismaModel.count({
      where: findManyArgs.where
    })
  ])

  return {
    data,
    page,
    limit,
    total
  }
}
