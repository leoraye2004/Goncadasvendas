import { prisma } from "@/lib/prisma";
import { createFavoriteRepository } from "@/repositories/favorite-repository";
import { createProductRepository } from "@/repositories/product-repository";
import { createFavoriteService } from "@/services/favorite-service";

// Liga o service de favoritos ao banco. Páginas e rotas usam esta instância.
export const favoriteService = createFavoriteService(createFavoriteRepository(prisma), createProductRepository(prisma));
