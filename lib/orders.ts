import { prisma } from "@/lib/prisma";
import { createAddressRepository } from "@/repositories/address-repository";
import { createCartRepository } from "@/repositories/cart-repository";
import { createOrderRepository } from "@/repositories/order-repository";
import { createOrderService } from "@/services/order-service";

// Liga o service de pedidos ao banco. Páginas e rotas usam esta instância.
export const orderService = createOrderService(
  createCartRepository(prisma),
  createAddressRepository(prisma),
  createOrderRepository(prisma),
);
