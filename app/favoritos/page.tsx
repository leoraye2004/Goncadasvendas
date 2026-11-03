import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import ProductCard from "@/components/ProductCard";
import { favoriteService } from "@/lib/favorites";
import { currentActor } from "@/lib/session";

export const metadata: Metadata = { title: "Favoritos" };
export const dynamic = "force-dynamic";

// UC07 — produtos favoritados pelo usuário logado (RN01). Produto que saiu do catálogo (RN03) não aparece.
export default async function FavoritosPage() {
  const resultado = await favoriteService.list(await currentActor());
  if (!resultado.ok) redirect("/login");

  return (
    <main className="bs-container py-10">
      <h1 className="mb-6 text-[2rem] font-bold leading-tight">Meus favoritos</h1>

      {resultado.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <p className="text-lg font-semibold">Você ainda não favoritou nenhum produto</p>
          <p className="mt-1 text-muted">Use o botão Favoritar na página de um produto.</p>
          <Link href="/" className="btn btn-primary mt-5">
            Ver o catálogo
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {resultado.data.map((produto) => (
            <li key={produto.id} className="flex flex-col gap-2">
              <ProductCard product={produto} />
              <FavoriteButton productId={produto.id} loggedIn favorite />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
