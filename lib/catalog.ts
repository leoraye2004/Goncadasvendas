import { prisma } from "@/lib/prisma";
import { createProductRepository } from "@/repositories/product-repository";
import { createCatalogService } from "@/services/catalog-service";

// Liga o service do catálogo ao banco. A home e a página do produto usam esta instância.
export const catalogService = createCatalogService(createProductRepository(prisma));
