import { prisma } from "@/lib/prisma";
import { createUserRepository } from "@/repositories/user-repository";
import { createProfileService } from "@/services/profile-service";

// Liga o service do perfil ao banco. A página /conta e as rotas /api/conta usam esta instância.
export const profileService = createProfileService(createUserRepository(prisma));
