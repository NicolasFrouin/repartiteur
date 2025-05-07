import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

prisma.$extends({
  query: {
    $allOperations: async ({ args, operation, query, model }) => {
      console.log(`Query: ${operation} on model ${model} with args:`, args);
      const result = await query(args);
      console.log(`Result:`, result);
      return result;
    },
  },
});

export default prisma;
