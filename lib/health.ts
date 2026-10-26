import { prisma } from "@/lib/prisma";
import { createHealthRepository } from "@/repositories/health-repository";
import { createHealthService } from "@/services/health-service";

// Liga o service de saúde ao banco. A rota /api/health usa esta instância.
export const healthService = createHealthService(createHealthRepository(prisma));
