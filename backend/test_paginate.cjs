const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { paginate } = require('./src/utils/paginate.js');

async function test() {
  const reqQuery = { page: 1, limit: 50 };
  const paginatedResult = await paginate(prisma.mous, reqQuery, {
    where: {},
    include: {
      our_pocs: true,
      partner_pocs: true,
      documents: true
    },
    orderBy: { created_at: 'desc' }
  });
  console.log(JSON.stringify(paginatedResult, null, 2));
  prisma.$disconnect();
}
test().catch(console.error);
