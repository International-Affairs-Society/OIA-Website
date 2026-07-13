const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.mous.findMany().then(r => {
  console.log('MOUs count:', r.length);
  if(r.length) console.log(r[0]);
  prisma.$disconnect();
}).catch(console.error);
