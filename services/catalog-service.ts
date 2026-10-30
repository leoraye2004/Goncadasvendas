import type { ProductRepository } from "@/repositories/product-repository";

type Product = NonNullable<Awaited<ReturnType<ProductRepository["findById"]>>>;

// RN03: o produto só aparece no catálogo se estiver ativo e com preço maior que zero.
const isVisible = (produto: Product) => produto.active && Number(produto.price) > 0;

// Regras de UC04 (navegar no catálogo). Qualquer pessoa pode ver o catálogo, mesmo sem login (RN01 só vale
// para carrinho, favoritos e pedido).
export function createCatalogService(products: Pick<ProductRepository, "list" | "findById">) {
  return {
    async browse(category?: string) {
      const visiveis = (await products.list()).filter(isVisible);
      const categories = [...new Set(visiveis.map((p) => p.category))].sort((a, b) => a.localeCompare(b, "pt-BR"));
      // Categoria que não existe (ou que só tem produto escondido) é ignorada: mostra tudo.
      const selected = category && categories.includes(category) ? category : undefined;

      return { categories, selected, products: selected ? visiveis.filter((p) => p.category === selected) : visiveis };
    },

    async detail(id: string) {
      const produto = await products.findById(id);
      return produto && isVisible(produto) ? produto : null;
    },
  };
}

export type CatalogService = ReturnType<typeof createCatalogService>;
