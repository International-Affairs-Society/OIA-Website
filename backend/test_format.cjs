const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { paginate } = require('./src/utils/paginate.js');

async function formatMou(mou) {
  if (!mou) return null
  return {
    id: mou.id,
    name: mou.name,
    partner_university: mou.partner_university,
    country: mou.country,
    type: mou.type ? mou.type.replace(/_/g, ' ') : mou.type,
    status: mou.status,
    duration: mou.duration,
    start_date: mou.start_date,
    expiry_date: mou.expiry_date,
    applicable_semesters: mou.applicable_semesters || [],
    eligible_schools: mou.eligible_schools || [],
    eligible_courses: mou.eligible_courses || [],
    notes: mou.notes,
    is_archived: mou.is_archived,
    review_status: mou.review_status,
    created_by: mou.created_by,
    our_pocs: mou.our_pocs || [],
    partner_pocs: mou.partner_pocs || [],
    documents: mou.documents || [],
    created_at: mou.created_at,
    updated_at: mou.updated_at
  }
}

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
  
  const formattedData = await Promise.all(paginatedResult.data.map(formatMou))
  console.log(JSON.stringify({ ...paginatedResult, data: formattedData }, null, 2));
  prisma.$disconnect();
}
test().catch(console.error);
