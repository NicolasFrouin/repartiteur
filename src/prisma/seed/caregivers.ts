import {
  Branch,
  Caregiver,
  CaregiverBigWeekType,
  CaregiverTime,
  PrismaClient,
  User,
} from '@/generated/client';
import { caregivers, randomColor, toSlug } from '@/lib/utils';

export async function seedCaregivers(
  prisma: PrismaClient,
  users: User[],
  branches: Branch[],
): Promise<Caregiver[]> {
  console.group('Seeding caregivers...');

  await prisma.caregiver.deleteMany();

  for (const [index, caregiver] of Object.entries(caregivers)) {
    caregiver.color = randomColor();
    caregiver.slug = toSlug([caregiver.firstname, caregiver.lastname].join(' '));

    const randomUser = users[Math.floor(Math.random() * users.length)];
    if (randomUser) {
      caregiver.createdById = randomUser.id;
      caregiver.updatedById = randomUser.id;
    }

    if (Number(index) % 2 === 0) {
      caregiver.bigWeekType = CaregiverBigWeekType.EVEN;
    } else {
      caregiver.bigWeekType = CaregiverBigWeekType.ODD;
    }

    if (Math.random() < 0.65) {
      caregiver.branchId = branches[0].id;
    } else {
      caregiver.branchId = branches[1].id;
    }

    caregiver.time = CaregiverTime.DAY;

    await prisma.caregiver.create({ data: caregiver as Caregiver });
    console.log(`Caregiver ${[caregiver.firstname, caregiver.lastname].join(' ')} created !`);
  }

  console.log('Caregivers seeded successfully !');
  console.groupEnd();

  return await prisma.caregiver.findMany();
}
