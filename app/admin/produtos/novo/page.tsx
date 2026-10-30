import type { Metadata } from "next";
import ProductForm from "@/components/ProductForm";

export const metadata: Metadata = { title: "Novo produto" };

export default function NovoProdutoPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Novo produto</h1>
      <ProductForm />
    </section>
  );
}
