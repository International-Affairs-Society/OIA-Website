import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('Starting seed...');

  // Clean up existing data in reverse order of dependencies
  await prisma.visit_delegations.deleteMany();
  await prisma.visit_our_pocs.deleteMany();
  await prisma.visit_reports.deleteMany();
  await prisma.visits.deleteMany();
  await prisma.notifications.deleteMany();
  await prisma.program_leads.deleteMany();
  await prisma.applications.deleteMany();
  await prisma.programs.deleteMany();
  await prisma.events.deleteMany();
  await prisma.mou_partner_pocs.deleteMany();
  await prisma.mou_our_pocs.deleteMany();
  await prisma.mou_documents.deleteMany();
  await prisma.mous.deleteMany();
  await prisma.students.deleteMany();
  await prisma.reviews.deleteMany();
  await prisma.users.deleteMany();

  console.log('Cleaned up existing data.');

  // 1. Create Users
  const superAdmin = await prisma.users.create({
    data: {
      email: 'superadmin@bennett.edu.in',
      name: 'Super Admin User',
      role: 'super_admin',
    },
  });

  const admin = await prisma.users.create({
    data: {
      email: 'admin@bennett.edu.in',
      name: 'Admin User',
      role: 'admin',
    },
  });

  const editor = await prisma.users.create({
    data: {
      email: 'editor@bennett.edu.in',
      name: 'Editor User',
      role: 'editor',
    },
  });

  const student1User = await prisma.users.create({
    data: {
      email: 'student1@bennett.edu.in',
      name: 'Alice Student',
      role: 'student',
    },
  });

  const student2User = await prisma.users.create({
    data: {
      email: 'student2@bennett.edu.in',
      name: 'Bob Student',
      role: 'student',
    },
  });

  console.log('Users created.');

  // 2. Create Student Records
  const student1 = await prisma.students.create({
    data: {
      user_id: student1User.id,
      enrollment_no: 'E1001',
      course: 'Computer Science',
      school: 'SCSET',
    },
  });

  const student2 = await prisma.students.create({
    data: {
      user_id: student2User.id,
      enrollment_no: 'E1002',
      course: 'Mechanical Engineering',
      school: 'SCSET',
    },
  });

  console.log('Student records created.');

  // 3. Create MOUs
  const mou1 = await prisma.mous.create({
    data: {
      name: 'Global Tech University MOU',
      partner_university: 'Global Tech University',
      country: 'USA',
      type: 'Semester_Exchange',
      status: 'Active',
      start_date: new Date('2023-01-01'),
      expiry_date: new Date('2028-01-01'),
      created_by: superAdmin.id
    },
  });

  const mou2 = await prisma.mous.create({
    data: {
      name: 'London School of Sciences MOU',
      partner_university: 'London School of Sciences',
      country: 'UK',
      type: 'Global_Immersion',
      status: 'Active',
      start_date: new Date('2022-05-15'),
      expiry_date: new Date('2025-05-15'),
      created_by: superAdmin.id
    },
  });

  console.log('MOUs created.');

  // 4. Create Programs
  const prog1 = await prisma.programs.create({
    data: {
      name: 'Summer Exchange in Silicon Valley',
      duration: '3 Months',
      partner: 'Global Tech University',
      mou: mou1.name,
      program_type: 'Semester Exchange',
      country: 'USA',
      start_date: new Date('2024-06-01'),
      last_date_to_apply: new Date('2024-05-31'),
      schools_eligible: ['SCSET', 'SEAS'],
      semesters_eligible: ['Semester 5', 'Semester 6'],
      courses_eligible: ['B.Tech', 'BCA'],
      overview: 'Learn everything about the summer exchange program.',
      highlights: ['Fully funded by partner', 'Industry mentors'],
      fee_summary: '₹15,000 approx.',
      fee_breakdown: 'Tuition Fee: ₹15,000',
      show_living_cost: false,
      use_default_form: true,
      status: 'published',
      created_by: superAdmin.id
    },
  });

  const prog2 = await prisma.programs.create({
    data: {
      name: 'Semester Abroad in London',
      duration: '6 Months',
      partner: 'London School of Sciences',
      mou: mou2.name,
      program_type: 'Global Immersion',
      country: 'UK',
      start_date: new Date('2024-09-01'),
      last_date_to_apply: new Date('2024-06-30'),
      schools_eligible: ['SCSET', 'SOM'],
      semesters_eligible: ['Semester 5', 'Semester 6', 'Semester 7'],
      courses_eligible: ['B.Tech', 'BBA'],
      overview: 'Experience academic life in London.',
      highlights: ['Central London campus', 'Cultural tours'],
      fee_summary: '₹25,000 approx.',
      fee_breakdown: 'Tuition Fee: ₹25,000',
      show_living_cost: false,
      use_default_form: true,
      status: 'published',
      created_by: superAdmin.id
    },
  });

  console.log('Programs created.');

  // 5. Create Events
  await prisma.events.create({
    data: {
      title: 'Info Session: Silicon Valley Exchange',
      event_type: 'upcoming',
      description: 'Learn everything about the summer exchange program.',
      location: 'Seminar Hall, SCSET',
      date: new Date('2026-08-15'),
      linked_mou_id: mou1.id,
      is_archived: false,
      add_to_homepage: false,
      status: 'published',
      created_by: superAdmin.id
    },
  });

  await prisma.events.create({
    data: {
      title: 'Global Village 2024',
      event_type: 'past',
      description: 'Relive the highlights of our biggest international event.',
      location: 'Bennett University Campus',
      date: new Date('2024-03-20'),
      linked_mou_id: mou1.id,
      is_archived: false,
      add_to_homepage: true,
      poster_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop',
      gallery_urls: [
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop'
      ],
      status: 'published',
      created_by: superAdmin.id
    },
  });

  console.log('Events created.');

  // 6. Create Applications
  await prisma.applications.create({
    data: {
      student_id: student1.id,
      program_id: prog1.id,
      status: 'Application Submitted',
      current_stage: 'Submitted',
    },
  });

  // 7. Create Program Leads
  await prisma.program_leads.create({
    data: {
      name: 'Charlie Student',
      phone: '+91 9999999999',
      email: 'charlie@bennett.edu.in',
      source_page: 'Silicon Valley Summer School',
    }
  });

  console.log('Applications and Leads created.');
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
