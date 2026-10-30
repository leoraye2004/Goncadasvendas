import { addressSchema } from "@/lib/validation/address";
import type { AddressRepository } from "@/repositories/address-repository";
import type { Actor } from "@/services/product-service";
import { falha, OK, SEM_LOGIN, type Result } from "@/services/result";

const NAO_ENCONTRADO = falha("NOT_FOUND", "Endereço não encontrado");

// Regras de UC08 (endereços de entrega) e RN01 (só logado). O userId vem sempre do Actor (a sessão), nunca do
// navegador, e o repository só enxerga endereços daquele userId.
export function createAddressService(addresses: AddressRepository) {
  return {
    async list(actor: Actor | null) {
      if (!actor) return SEM_LOGIN;
      return { ok: true, data: await addresses.list(actor.id) } as const;
    },

    async get(actor: Actor | null, id: string) {
      if (!actor) return SEM_LOGIN;
      const endereco = await addresses.findOwned(actor.id, id);
      return endereco ? ({ ok: true, data: endereco } as const) : NAO_ENCONTRADO;
    },

    async create(actor: Actor | null, input: unknown) {
      if (!actor) return SEM_LOGIN;
      const dados = addressSchema.safeParse(input);
      if (!dados.success) return falha("INVALID", dados.error.issues[0].message);

      return { ok: true, data: await addresses.create(actor.id, dados.data) } as const;
    },

    async update(actor: Actor | null, id: string, input: unknown): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      const dados = addressSchema.safeParse(input);
      if (!dados.success) return falha("INVALID", dados.error.issues[0].message);

      return (await addresses.update(actor.id, id, dados.data)) === 0 ? NAO_ENCONTRADO : OK;
    },

    async remove(actor: Actor | null, id: string): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      return (await addresses.remove(actor.id, id)) === 0 ? NAO_ENCONTRADO : OK;
    },
  };
}

export type AddressService = ReturnType<typeof createAddressService>;
