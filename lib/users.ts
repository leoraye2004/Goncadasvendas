import { prisma } from "@/lib/prisma";
import { createUserRepository } from "@/repositories/user-repository";
import { createUserService } from "@/services/user-service";

// Liga o service de administração de usuários ao banco. Páginas e rotas do admin usam esta instância.
export const userService = createUserService(createUserRepository(prisma));
