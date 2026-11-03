"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { apiRequest } from "@/components/api-request";
import FormError from "@/components/FormError";

// UC05 — botão da página do produto. Visitante é convidado a entrar (RN01); logado escolhe a quantidade.
export default function AddToCartButton({ productId, loggedIn }: Readonly<{ productId: string; loggedIn: boolean }>) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string>();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!loggedIn) {
    return (
      <Link href="/login" className="btn btn-primary btn-lg">
        Entrar para comprar
      </Link>
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setAdded(false);
    setLoading(true);
    const erro = await apiRequest("/api/carrinho", "POST", { productId, quantity });
    setLoading(false);
    if (erro) return setError(erro);
    setAdded(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormError message={error} />
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="quantity" className="sr-only">
          Quantidade
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={99}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="form-control w-24"
        />
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
          {loading ? "Adicionando..." : "Adicionar ao carrinho"}
        </button>
      </div>
      {added && (
        <p className="form-success" role="status">
          Adicionado ao carrinho.{" "}
          <Link href="/carrinho" className="font-semibold underline">
            Ver carrinho
          </Link>
        </p>
      )}
    </form>
  );
}
