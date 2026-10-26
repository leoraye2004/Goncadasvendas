import type { PrismaClient } from "@prisma/client";

// Pergunta mais simples possível ao banco ("você está aí?"). Se o banco estiver fora do ar,
// o erro sobe e quem decide o que fazer com ele é o service.
export function createHealthRepository(db: PrismaClient) {
  return {
    ping: async (): Promise<void> => {
      await db.$queryRaw`SELECT 1`;
    },
  };
}

export type HealthRepository = ReturnType<typeof createHealthRepository>;
