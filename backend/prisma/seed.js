import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean up existing data in reverse order of dependencies
  await prisma.stage_history.deleteMany();
  await prisma.documents.deleteMany();
  await prisma.applications.deleteMany();
  await prisma.programs.deleteMany();
  await prisma.events.deleteMany();
  await prisma.mous.deleteMany();
  await prisma.universities.deleteMany();
  await prisma.student_records.deleteMany();
  await prisma.change_requests.deleteMany();
  await prisma.notifications.deleteMany();
  await prisma.users.deleteMany();

  console.log('Cleaned up existing data.');

  // 1. Create Users
  const superAdmin = await prisma.users.create({
    data: {
      email: 'superadmin@bennett.edu.in',
      display_name: 'Super Admin User',
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.users.create({
    data: {
      email: 'admin@bennett.edu.in',
      display_name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const editor = await prisma.users.create({
    data: {
      email: 'editor@bennett.edu.in',
      display_name: 'Editor User',
      role: 'EDITOR',
    },
  });

  const student1 = await prisma.users.create({
    data: {
      email: 'student1@bennett.edu.in',
      display_name: 'Alice Student',
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.users.create({
    data: {
      email: 'student2@bennett.edu.in',
      display_name: 'Bob Student',
      role: 'STUDENT',
    },
  });

  console.log('Users created.');

  // 2. Create Student Records
  await prisma.student_records.create({
    data: {
      user_id: student1.id,
      enrollment_id: 'E1001',
      department: 'Computer Science',
      batch_year: 2024,
      program_type: 'B.Tech',
    },
  });

  await prisma.student_records.create({
    data: {
      user_id: student2.id,
      enrollment_id: 'E1002',
      department: 'Mechanical Engineering',
      batch_year: 2024,
      program_type: 'B.Tech',
    },
  });

  console.log('Student records created.');

  // 3. Create Universities
  const uni1 = await prisma.universities.create({
    data: {
      name: 'Global Tech University',
      country: 'USA',
    },
  });

  const uni2 = await prisma.universities.create({
    data: {
      name: 'London School of Sciences',
      country: 'UK',
    },
  });

  console.log('Universities created.');

  // 4. Create MOUs
  const mou1 = await prisma.mous.create({
    data: {
      partner_university_id: uni1.id,
      signed_date: new Date('2023-01-01'),
      expiry_date: new Date('2028-01-01'),
      status: 'ACTIVE',
    },
  });

  const mou2 = await prisma.mous.create({
    data: {
      partner_university_id: uni2.id,
      signed_date: new Date('2022-05-15'),
      expiry_date: new Date('2025-05-15'),
      status: 'ACTIVE',
    },
  });

  console.log('MOUs created.');

  // 5. Create Programs
  const prog1 = await prisma.programs.create({
    data: {
      mou_id: mou1.id,
      title: 'Summer Exchange in Silicon Valley',
      country: 'USA',
      duration: '3 Months',
      fee: 1500.00,
      seats_total: 20,
      seats_remaining: 20,
      status: 'OPEN',
      apply_open_date: new Date('2024-01-01'),
      apply_close_date: new Date('2024-05-31'),
      type: 'SUMMER_EXCHANGE',
    },
  });

  const prog2 = await prisma.programs.create({
    data: {
      mou_id: mou2.id,
      title: 'Semester Abroad in London',
      country: 'UK',
      duration: '6 Months',
      fee: 2500.00,
      seats_total: 10,
      seats_remaining: 10,
      status: 'OPEN',
      apply_open_date: new Date('2024-02-01'),
      apply_close_date: new Date('2024-06-30'),
      type: 'SEMESTER_EXCHANGE',
    },
  });

  console.log('Programs created.');

  // 6. Create Events
  await prisma.events.create({
    data: {
      mou_id: mou1.id,
      title: 'Info Session: Silicon Valley Exchange',
      event_date: new Date('2024-03-15T10:00:00Z'),
      type: 'WEBINAR',
      description: 'Learn everything about the summer exchange program.',
      visibility: 'PUBLIC',
    },
  });

  console.log('Events created.');

  // 7. Create Applications
  const app1 = await prisma.applications.create({
    data: {
      user_id: student1.id,
      program_id: prog1.id,
      stage: 'RECEIVED',
    },
  });

  // 8. Create Stage History for Application
  await prisma.stage_history.create({
    data: {
      application_id: app1.id,
      to_stage: 'RECEIVED',
      changed_by_id: student1.id,
      note: 'Initial application submitted',
    },
  });

  console.log('Applications created.');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
