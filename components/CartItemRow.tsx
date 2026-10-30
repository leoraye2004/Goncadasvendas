"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cartRequest } from "@/components/cart-request";
import FormError from "@/components/FormError";
import { formatBRL } from "@/lib/format";

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
};

// Uma linha do carrinho: foto, nome, quantidade editável, subtotal e botão de excluir.
export default function CartItemRow({ item }: Readonly<{ item: CartLine }>) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [error, setError] = useState<string>();

  async function enviar(method: "PATCH" | "DELETE") {
    setError(undefined);
    const erro = await cartRequest(`/api/carrinho/${item.id}`, method, method === "PATCH" ? { quantity } : undefined);
    if (erro) return setError(erro);
    router.refresh();
  }

  return (
    <li className="grid items-center gap-4 p-5 sm:grid-cols-[88px_1fr_auto_auto]">
      {/* A foto repete o link do nome: fica fora da leitura de tela e da tabulação. */}
      <Link href={`/produto/${item.productId}`} aria-hidden="true" tabIndex={-1} className="block aspect-square w-[88px] overflow-hidden rounded-xl bg-light">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- as fotos vêm do Blob Storage (URL externa)
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted">Sem imagem</span>
        )}
      </Link>

      <div>
        <h2 className="font-semibold leading-snug">
          <Link href={`/produto/${item.productId}`} className="hover:text-brand hover:underline">
            {item.name}
          </Link>
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor={`qtd-${item.id}`} className="sr-only">
            Quantidade de {item.name}
          </label>
          <input
            id={`qtd-${item.id}`}
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="form-control w-20 text-sm"
          />
          <button type="button" onClick={() => enviar("PATCH")} className="text-sm font-medium text-brand hover:underline">
            Atualizar
          </button>
        </div>
        <FormError message={error} />
      </div>

      <div className="sm:text-right">
        <p className="text-sm text-muted">
          {item.quantity} × {formatBRL(item.unitPrice)}
        </p>
        <p className="text-lg font-bold">{formatBRL(item.lineTotal)}</p>
      </div>

      <button
        type="button"
        onClick={() => enviar("DELETE")}
        aria-label={`Excluir ${item.name}`}
        className="btn btn-outline-danger btn-sm sm:justify-self-end"
      >
        Excluir
      </button>
    </li>
  );
}
