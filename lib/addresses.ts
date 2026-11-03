import { prisma } from "@/lib/prisma";
import { createAddressRepository } from "@/repositories/address-repository";
import { createAddressService } from "@/services/address-service";

// Liga o service de endereços ao banco. Páginas e rotas usam esta instância.
export const addressService = createAddressService(createAddressRepository(prisma));
