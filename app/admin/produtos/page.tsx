import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteProductButton from "@/components/DeleteProductButton";
import { formatBRL } from "@/lib/format";
import { productService } from "@/lib/products";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Produtos" };
export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const result = await productService.list(await requireAdmin());
  if (!result.ok) redirect("/");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn btn-primary">Novo produto</Link>
      </div>

      <div className="panel overflow-x-auto">
        <table className="bs-table">
          <thead>
            <tr><th>Imagem</th><th>Nome</th><th>Categoria</th><th>Marca</th><th>Preço</th><th className="text-right">Ações</th></tr>
          </thead>
          <tbody>
            {result.data.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted">Nenhum produto cadastrado ainda.</td></tr>
            )}
            {result.data.map((produto) => (
              <tr key={produto.id}>
                <td>
                  {produto.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- as imagens vêm do Blob (domínio externo)
                    <img src={produto.images[0].url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <span className="text-xs text-muted">sem imagem</span>
                  )}
                </td>
                <td className="font-medium">{produto.name}</td>
                <td>{produto.category}</td>
                <td>{produto.brand ?? "—"}</td>
                <td>{formatBRL(produto.price)}</td>
                <td className="whitespace-nowrap text-right">
                  <Link href={`/admin/produtos/${produto.id}`} className="btn btn-outline-primary btn-sm mr-2">Editar</Link>
                  <DeleteProductButton id={produto.id} name={produto.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
