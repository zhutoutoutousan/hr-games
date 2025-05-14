import { PrismaClient } from '@prisma/client';

const connectionTimeoutUrl = process.env.DATABASE_URL + '?connection_timeout=300&pool_timeout=300';

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionTimeoutUrl
      }
    },
    log: ['error', 'warn']
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma }; 