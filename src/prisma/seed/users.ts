import { PrismaClient, Role, User } from '@/generated/client';
import { NonRequired } from '@/types/utils';
import { hashSync } from 'bcryptjs';

export const users: NonRequired<User>[] = [
  {
    email: 'user@app.com',
    name: 'Mr User',
    role: Role.USER,
    emailVerified: null,
    image: null,
    password: hashSync('pistache', 12),
  },
  {
    email: 'admin@app.com',
    name: 'Ms Admin',
    role: Role.ADMIN,
    emailVerified: null,
    image: null,
    password: hashSync('pistache', 12),
  },
  {
    email: 'superadmin@app.com',
    name: 'Sir Superadmin',
    role: Role.SUPERADMIN,
    emailVerified: null,
    image: null,
    password: hashSync('pistache', 12),
  },
  {
    email: 'archivedadmin@app.com',
    name: 'Archived Admin',
    role: Role.ADMIN,
    emailVerified: null,
    image: null,
    archived: true,
    password: hashSync('pistache', 12),
  },
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
