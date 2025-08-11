import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding Phase 2B Industry data...');
  
  // Create sources
  const esvSource = await prisma.industrySource.upsert({
    where: { name: 'ESV Victoria' },
    create: {
      name: 'ESV Victoria',
      url: 'https://esv.vic.gov.au',
      isActive: true,
    },
    update: {},
  });

  const meaSource = await prisma.industrySource.upsert({
    where: { name: 'Master Electricians Australia' },
    create: {
      name: 'Master Electricians Australia',
      url: 'https://www.masterelectricians.com.au',
      isActive: true,
    },
    update: {},
  });

  // Create sample items
  await prisma.industryItem.create({
    data: {
      sourceId: esvSource.id,
      contentType: 'regulation',
      category: 'electrical safety',
      title: 'Electrical Safety Requirements for RCDs',
      content: 'All electrical installations must have Residual Current Devices (RCDs) installed on all power and lighting circuits. This is mandatory under AS/NZS 3000:2018.',
      relevanceScore: 0.95,
      sourceUrl: 'https://esv.vic.gov.au/safety/rcds',
    },
  });

  await prisma.industryItem.create({
    data: {
      sourceId: esvSource.id,
      contentType: 'safety',
      category: 'workplace safety',
      title: 'Working at Heights Safety Advisory',
      content: 'When working at heights above 2 meters, appropriate fall protection must be in place including harnesses, scaffolding, or elevated work platforms.',
      relevanceScore: 0.88,
    },
  });

  await prisma.industryItem.create({
    data: {
      sourceId: meaSource.id,
      contentType: 'pricing',
      category: 'service pricing',
      title: 'Average Electrical Service Call Rates 2024',
      content: 'Average call-out fees in Victoria range from $80-150 for standard hours, with hourly rates between $100-180 for licensed electricians.',
      relevanceScore: 0.92,
    },
  });

  await prisma.industryItem.create({
    data: {
      sourceId: meaSource.id,
      contentType: 'best_practice',
      category: 'customer service',
      title: 'Best Practices for Quote Preparation',
      content: 'Provide detailed written quotes including: scope of work, materials list, labor costs, timeline, warranty terms, and payment schedule.',
      relevanceScore: 0.85,
    },
  });

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
