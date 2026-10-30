import { createBlobStorage } from "@/lib/blob-storage";
import { prisma } from "@/lib/prisma";
import { createProductRepository } from "@/repositories/product-repository";
import { createProductService } from "@/services/product-service";

// Único lugar onde o service de produtos é ligado ao banco e ao Blob. Páginas e rotas usam esta instância.
export const productService = createProductService(
  createProductRepository(prisma),
  createBlobStorage(process.env.AZURE_STORAGE_CONNECTION_STRING),
);
