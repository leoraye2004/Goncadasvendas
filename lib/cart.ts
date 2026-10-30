import { prisma } from "@/lib/prisma";
import { createCartRepository } from "@/repositories/cart-repository";
import { createProductRepository } from "@/repositories/product-repository";
import { createCartService } from "@/services/cart-service";

// Liga o service do carrinho ao banco. Páginas, rotas e o cabeçalho usam esta instância.
export const cartService = createCartService(createCartRepository(prisma), createProductRepository(prisma));
