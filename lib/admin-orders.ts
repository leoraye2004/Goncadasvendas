import { prisma } from "@/lib/prisma";
import { createOrderRepository } from "@/repositories/order-repository";
import { createAdminOrderService } from "@/services/admin-order-service";

// Liga o service de pedidos do admin ao banco. Páginas e rotas do admin usam esta instância.
export const adminOrderService = createAdminOrderService(createOrderRepository(prisma));
