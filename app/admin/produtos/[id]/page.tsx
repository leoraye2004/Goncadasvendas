import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { productService } from "@/lib/products";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Editar produto" };
export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const result = await productService.get(await requireAdmin(), id);
  if (!result.ok) notFound();

  const { data: produto } = result;
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Editar produto</h1>
      <ProductForm
        product={{
          id: produto.id,
          name: produto.name,
          category: produto.category,
          brand: produto.brand ?? "",
          price: String(produto.price).replace(".", ","),
          images: produto.images.map(({ id: imagemId, url }) => ({ id: imagemId, url })),
        }}
      />
    </section>
  );
}
