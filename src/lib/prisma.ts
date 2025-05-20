import { PrismaClient } from '@/generated/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient().$extends({
    query: {
      $allOperations: async ({ args, operation, query, model }) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[PRISMA] ${model}::${operation}`);
        }
        return await query(args);
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
