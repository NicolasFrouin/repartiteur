import { PrismaClient, PrismaPromise } from '@/generated/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';

const LOG =
  process.env.NODE_ENV === 'development' &&
  process.env.PRISMA_LOG &&
  process.env.PRISMA_LOG !== 'none';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

type PrismaExcludedKeys = `$${string}` | keyof object | symbol;
type PrismaModelNames = Exclude<keyof PrismaClient, PrismaExcludedKeys>;
type PrismaModelsQueries = Exclude<keyof PrismaClient[PrismaModelNames], PrismaExcludedKeys>;

const adapter = new PrismaBetterSQLite3({
  url: `src/prisma/${process.env.DATABASE_URL.replace('file:', '')}`,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }).$extends({
    query: {
      $allOperations: async ({
        args,
        operation,
        query,
        model,
      }): Promise<PrismaPromise<unknown>> => {
        if (LOG) {
          console.log(`[PRISMA] ${model}::${operation}`);
          if (process.env.PRISMA_LOG === 'all')
            console.log(`[PRISMA] Args before : ${JSON.stringify(args)}`);
        }

        const ogOperation = operation;

        switch (operation) {
          case 'findUnique':
          case 'findFirst':
          case 'findUniqueOrThrow':
          case 'findFirstOrThrow':
          case 'findMany':
          case 'update':
          case 'updateMany':
            if (
              !(
                args?.where?.archived !== undefined ||
                args?.where?.OR?.every((arg: Record<string, unknown>) => arg.archived !== undefined)
              )
            ) {
              args = { ...(args || {}), where: { ...(args.where || {}), archived: false } };
            }
            break;
          case 'delete':
          case 'deleteMany':
            let forceDelete = false;

            if (args?.where?.forceDelete === true) {
              forceDelete = true;
              delete args.where.forceDelete;
            } else {
              if (args?.where?.OR?.length >= 2) {
                const deleteChecks = [false, false];
                for (const arg of args.where.OR) {
                  if (arg.archived !== undefined) {
                    deleteChecks[Number(arg.archived)] = true;
                  }
                }
                forceDelete = deleteChecks.every((v) => v === true);
              }
            }
            if (!forceDelete) {
              operation = operation === 'delete' ? 'update' : 'updateMany';
              args = { ...(args || {}), data: { ...(args.data || {}), archived: true } };
            }
            break;
        }
        if (LOG) {
          if (process.env.PRISMA_LOG === 'all')
            console.log(`[PRISMA] Args after : ${JSON.stringify(args)}`);
        }
        if (operation !== ogOperation) {
          // @ts-expect-error ---
          return await prisma[model as PrismaModelNames][operation as PrismaModelsQueries](args);
        }
        return await query(args);
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
