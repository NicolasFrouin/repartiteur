import { Branch, PrismaClient, User } from '@/generated/client';
import { branches, randomColor, toSlug } from '@/lib/utils';

export async function seedBranches(prisma: PrismaClient, users: User[]): Promise<Branch[]> {
  console.group('Seeding branches...');

  await prisma.mission.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.branch.deleteMany();

  for (const branch of branches) {
    branch.color = randomColor();
    branch.slug = toSlug(branch.name || '');

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const userData = {} as { createdById?: string; updatedById?: string };
    if (randomUser) {
      userData.createdById = randomUser.id;
      userData.updatedById = randomUser.id;
    }

    const { sectors, ...branchData } = branch;
    const createdBranches = await prisma.branch.createManyAndReturn({
      data: { ...branchData, ...userData },
    });
    console.group(`Branch ${branch.name} created !`);

    for (const createdBranch of createdBranches) {
      for (const sector of sectors) {
        sector.color = randomColor();
        sector.slug = toSlug(sector.name || '');

        const { missions, ...sectorData } = sector;
        const createdSectors = await prisma.sector.createManyAndReturn({
          data: { ...sectorData, branchId: createdBranch.id, ...userData },
        });
        console.group(`Sector ${sector.name} created !`);

        for (const createdSector of createdSectors) {
          for (const mission of missions) {
            mission.color = randomColor();
            mission.slug = toSlug(mission.name || '');

            await prisma.mission.createManyAndReturn({
              data: { ...mission, sectorId: createdSector.id, ...userData },
            });
            console.log(`Mission ${mission.name} created !`);
          }
        }
        console.groupEnd();
      }
    }
    console.groupEnd();
  }

  console.groupEnd();

  return await prisma.branch.findMany({ include: { sectors: { include: { missions: true } } } });
}
