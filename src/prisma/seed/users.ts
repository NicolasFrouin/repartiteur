import { PrismaClient, Role, User } from '@/generated/client';
import { NonRequired } from '@/types/utils';
import { hashSync } from 'bcrypt';

export const users: NonRequired<User>[] = [
  {
    email: 'user@app.com',
    name: 'user',
    role: Role.USER,
    emailVerified: null,
    image: null,
    password: hashSync('pistache', 12),
  },
  {
    email: 'admin@app.com',
    name: 'admin',
    role: Role.ADMIN,
    emailVerified: null,
    image: null,
    password: hashSync('pistache', 12),
  },
  {
    email: 'superadmin@app.com',
    name: 'superadmin',
    role: Role.SUPERADMIN,
    emailVerified: null,
    image: null,
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
