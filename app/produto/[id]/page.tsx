import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import { catalogService } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";
import { currentActor } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = Readonly<{ params: Promise<{ id: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const produto = await catalogService.detail((await params).id);
  return { title: produto?.name ?? "Produto não encontrado" };
}

// UC04 — detalhe do produto com a galeria de fotos. Produto escondido (RN03) ou inexistente vira 404.
export default async function ProdutoPage({ params }: Props) {
  const produto = await catalogService.detail((await params).id);
  if (!produto) notFound();
  const loggedIn = (await currentActor()) !== null;

  return (
    <main className="bs-container py-8">
      <nav aria-label="Você está em" className="mb-5 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand hover:underline">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/?categoria=${encodeURIComponent(produto.category)}`} className="hover:text-brand hover:underline">
              {produto.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="max-w-[240px] truncate font-medium text-ink">
            {produto.name}
          </li>
        </ol>
      </nav>

      <div className="panel grid gap-8 p-5 md:grid-cols-[5fr_6fr] md:p-8">
        <ProductGallery name={produto.name} urls={produto.images.map((imagem) => imagem.url)} />

        <div>
          {produto.brand && <p className="text-xs font-semibold uppercase tracking-wide text-muted">{produto.brand}</p>}
          <h1 className="mt-1 text-[1.75rem] font-bold leading-tight">{produto.name}</h1>
          <p className="mt-1 text-sm text-muted">{produto.category}</p>
          <p className="mt-4 text-[2rem] font-bold leading-none">{formatBRL(produto.price)}</p>
          <div className="mt-6">
            <AddToCartButton productId={produto.id} loggedIn={loggedIn} />
          </div>
        </div>
      </div>
    </main>
  );
}
