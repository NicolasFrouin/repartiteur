import { hashSync } from 'bcrypt';
import { PrismaClient, User } from '@/generated/client';
import { NonRequired } from '@/types/utils';

export const users: NonRequired<User>[] = [
  { email: 'admin@example.com', name: 'admin', password: hashSync('pass', 10) },
];

export async function seedUsers(prisma: PrismaClient): Promise<User[]> {
  console.group('Seeding users...');

  await prisma.user.deleteMany();

  for (const user of users) {
    await prisma.user.create({ data: user });
    console.log(`User ${user.name} (${user.email}) created !`);
  }

  console.log('Users seeded successfully !');
  console.groupEnd();

  return await prisma.user.findMany();
}
