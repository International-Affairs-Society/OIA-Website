import prisma from './lib/prisma.js';

async function main() {
  const visits = await prisma.visits.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log("Visit records:");
  console.log(JSON.stringify(visits, null, 2));
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
