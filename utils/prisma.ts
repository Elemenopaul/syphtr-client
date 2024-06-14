// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// check if we are in production
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // ensure that in development we have only one instance of Prisma Client
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

export default prisma;