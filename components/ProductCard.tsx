import Link from "next/link";
import { formatBRL } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  price: number;
  imageUrl?: string;
};

// Cartão do catálogo: foto, categoria e marca, nome e preço. Tudo é um link para a página do produto.
export default function ProductCard({ product }: Readonly<{ product: ProductCardData }>) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-bs-sm transition hover:-translate-y-1 hover:shadow-bs motion-reduce:transition-none">
      <Link href={`/produto/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-light">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- as imagens vêm do Blob (domínio externo)
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">Sem imagem</div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {product.category}
            {product.brand ? ` · ${product.brand}` : ""}
          </p>
          <h3 className="mt-1 line-clamp-2 flex-1 text-base font-semibold leading-snug text-ink">{product.name}</h3>
          <p className="mt-3 text-xl font-bold text-ink">{formatBRL(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
