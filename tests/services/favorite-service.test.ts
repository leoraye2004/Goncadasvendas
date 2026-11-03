import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { FavoriteRepository } from "@/repositories/favorite-repository";
import type { ProductRepository } from "@/repositories/product-repository";
import { createFavoriteService } from "@/services/favorite-service";

const cliente = { id: "u1", role: "CUSTOMER" } as const;

const produto = (over: Record<string, unknown> = {}) =>
  ({ id: "p1", name: "Camiseta", price: 49.9, active: true, category: "Roupas", brand: null, images: [{ url: "https://blob/a.png" }], ...over }) as never;
const favorito = (productId: string, over: Record<string, unknown> = {}) =>
  ({ id: `f-${productId}`, userId: "u1", productId, product: produto({ id: productId, ...over }) }) as never;

let favorites: ReturnType<typeof mock<FavoriteRepository>>;
let products: ReturnType<typeof mock<Pick<ProductRepository, "findById">>>;
let service: ReturnType<typeof createFavoriteService>;

beforeEach(() => {
  favorites = mock<FavoriteRepository>();
  products = mock<Pick<ProductRepository, "findById">>();
  products.findById.mockResolvedValue(produto());
  service = createFavoriteService(favorites, products);
});

describe("RN01 — favoritos só para usuário autenticado", () => {
  it.each([
    ["list", () => service.list(null)],
    ["add", () => service.add(null, "p1")],
    ["remove", () => service.remove(null, "p1")],
  ])("%s sem login devolve UNAUTHENTICATED e não toca no banco", async (_nome, chamar) => {
    expect(await chamar()).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
    expect(favorites.list).not.toHaveBeenCalled();
    expect(favorites.add).not.toHaveBeenCalled();
    expect(favorites.remove).not.toHaveBeenCalled();
  });

  it("isFavorite sem login é false", async () => {
    expect(await service.isFavorite(null, "p1")).toBe(false);
    expect(favorites.exists).not.toHaveBeenCalled();
  });
});

describe("favoriteService.add", () => {
  it("favorita um produto visível usando o userId do Actor", async () => {
    expect((await service.add(cliente, "p1")).ok).toBe(true);
    expect(favorites.add).toHaveBeenCalledWith("u1", "p1");
  });

  it("produto inexistente, inativo ou sem preço (RN03) vira NOT_FOUND", async () => {
    for (const p of [null, produto({ active: false }), produto({ price: 0 })]) {
      products.findById.mockResolvedValue(p);
      expect(await service.add(cliente, "p1")).toMatchObject({ ok: false, code: "NOT_FOUND" });
    }
    expect(favorites.add).not.toHaveBeenCalled();
  });
});

describe("favoriteService.remove", () => {
  it("remove o favorito do usuário", async () => {
    expect((await service.remove(cliente, "p1")).ok).toBe(true);
    expect(favorites.remove).toHaveBeenCalledWith("u1", "p1");
  });

  it("é idempotente: remover o que não era favorito também dá certo", async () => {
    favorites.remove.mockResolvedValue(0);
    expect((await service.remove(cliente, "p1")).ok).toBe(true);
  });
});

describe("favoriteService.list", () => {
  it("lista os favoritos escondendo produtos que saíram do catálogo (RN03)", async () => {
    favorites.list.mockResolvedValue([favorito("p1"), favorito("p2", { active: false }), favorito("p3", { price: 0 })]);

    const resultado = await service.list(cliente);

    expect(favorites.list).toHaveBeenCalledWith("u1");
    expect(resultado).toEqual({
      ok: true,
      data: [{ id: "p1", name: "Camiseta", category: "Roupas", brand: null, price: 49.9, imageUrl: "https://blob/a.png" }],
    });
  });

  it("produto sem imagem fica sem imageUrl", async () => {
    favorites.list.mockResolvedValue([favorito("p1", { images: [] })]);

    const resultado = await service.list(cliente);

    expect(resultado.ok && resultado.data[0].imageUrl).toBeUndefined();
  });
});

describe("favoriteService.isFavorite", () => {
  it("consulta o repository com o userId do Actor", async () => {
    favorites.exists.mockResolvedValue(true);

    expect(await service.isFavorite(cliente, "p1")).toBe(true);
    expect(favorites.exists).toHaveBeenCalledWith("u1", "p1");
  });
});
