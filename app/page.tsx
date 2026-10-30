import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import { catalogService } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// UC04 — catálogo. A categoria vem da URL (/?categoria=Roupas); quem decide o que aparece é o catalog-service (RN03).
export default async function Home({ searchParams }: Readonly<{ searchParams: Promise<{ categoria?: string }> }>) {
  const { categoria } = await searchParams;
  const { categories, selected, products } = await catalogService.browse(categoria);

  return (
    <>
      <section className="bg-header text-white">
        <div className="bs-container py-12 text-center sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">GoncadasVendas</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-white/75">
            Plataforma web de gestão de vendas para pequenos comércios.
          </p>
        </div>
      </section>

      <main className="bs-container space-y-6 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold">{selected ?? "Todos os produtos"}</h2>
          <p className="text-sm text-muted" aria-live="polite">
            {products.length} {products.length === 1 ? "produto" : "produtos"}
          </p>
        </div>

        {categories.length > 0 && <CategoryFilter categories={categories} selected={selected} />}

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
            <h2 className="text-xl font-semibold">Nossa vitrine está sendo preparada</h2>
            <p className="mt-2 text-muted">Em breve novos produtos por aqui. Volte já!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((produto) => (
              <ProductCard
                key={produto.id}
                product={{
                  id: produto.id,
                  name: produto.name,
                  category: produto.category,
                  brand: produto.brand,
                  price: Number(produto.price),
                  imageUrl: produto.images[0]?.url,
                }}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
