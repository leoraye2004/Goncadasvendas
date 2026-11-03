import type { FavoriteRepository } from "@/repositories/favorite-repository";
import type { ProductRepository } from "@/repositories/product-repository";
import type { Actor } from "@/services/product-service";
import { falha, OK, SEM_LOGIN, type Result } from "@/services/result";

type Produto = { price: unknown; active: boolean };
// RN03: produto inativo ou sem preço não aparece no catálogo, então também não pode ser favoritado nem listado.
const visivel = (produto: Produto) => produto.active && Number(produto.price) > 0;

// Regras de UC07 (favoritos) e RN01 (só logado). O userId vem sempre do Actor, nunca do navegador.
export function createFavoriteService(favorites: FavoriteRepository, products: Pick<ProductRepository, "findById">) {
  return {
    async list(actor: Actor | null) {
      if (!actor) return SEM_LOGIN;
      const favoritos = (await favorites.list(actor.id)).filter((favorito) => visivel(favorito.product));

      return {
        ok: true,
        data: favoritos.map(({ product }) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          brand: product.brand,
          price: Number(product.price),
          imageUrl: product.images[0]?.url,
        })),
      } as const;
    },

    async add(actor: Actor | null, productId: string): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      const produto = await products.findById(productId);
      if (!produto || !visivel(produto)) return falha("NOT_FOUND", "Produto não encontrado");

      await favorites.add(actor.id, productId);
      return OK;
    },

    // Idempotente: remover quem não era favorito também dá certo.
    async remove(actor: Actor | null, productId: string): Promise<Result<void>> {
      if (!actor) return SEM_LOGIN;
      await favorites.remove(actor.id, productId);
      return OK;
    },

    // Usado na página do produto para pintar o coração. Visitante nunca tem favoritos.
    async isFavorite(actor: Actor | null, productId: string) {
      return actor ? favorites.exists(actor.id, productId) : false;
    },
  };
}

export type FavoriteService = ReturnType<typeof createFavoriteService>;
