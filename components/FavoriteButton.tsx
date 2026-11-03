"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/components/api-request";
import FormError from "@/components/FormError";

type Props = Readonly<{ productId: string; loggedIn: boolean; favorite: boolean }>;

// UC07 — botão de favoritar (página do produto e lista de favoritos). Visitante é convidado a entrar (RN01).
export default function FavoriteButton({ productId, loggedIn, favorite }: Props) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(favorite);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  if (!loggedIn) {
    return (
      <Link href="/login" className="btn btn-outline-primary">
        Entrar para favoritar
      </Link>
    );
  }

  async function toggle() {
    setError(undefined);
    setLoading(true);
    const erro = isFavorite
      ? await apiRequest(`/api/favoritos/${productId}`, "DELETE")
      : await apiRequest("/api/favoritos", "POST", { productId });
    setLoading(false);
    if (erro) return setError(erro);
    setIsFavorite(!isFavorite);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <FormError message={error} />
      <button type="button" onClick={toggle} disabled={loading} className="btn btn-outline-primary">
        <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span> {isFavorite ? "Remover dos favoritos" : "Favoritar"}
      </button>
    </div>
  );
}
