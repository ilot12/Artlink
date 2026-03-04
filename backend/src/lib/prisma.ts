import { PrismaClient } from '@prisma/client';

// 싱글톤 Prisma 클라이언트 (개발 중 핫 리로딩 시 연결 과다 방지)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
