import prisma from '@/lib/prisma';
import { seedAssignments } from './assignments';
import { seedBranches } from './branches';
import { seedCaregivers } from './caregivers';
import { seedUsers } from './users';

async function main() {
  const users = await seedUsers(prisma);
  const branches = await seedBranches(prisma, users);
  if (process.env.NODE_ENV !== 'production') {
    await seedCaregivers(prisma, users, branches);
    await seedAssignments(prisma);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
