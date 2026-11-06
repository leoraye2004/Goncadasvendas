"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { apiCall } from "@/components/api-request";
import FormError from "@/components/FormError";
import { useToast } from "@/components/ToastProvider";

export type AddressOption = { id: string; label: string };

// UC06 — escolhe o endereço e confirma o pedido. O servidor confere carrinho, endereço e login (order-service).
export default function CheckoutForm({ addresses }: Readonly<{ addresses: AddressOption[] }>) {
  const router = useRouter();
  const toast = useToast();
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-[#ffe69c] bg-[#fff3cd] p-4 text-sm text-[#664d03]">
        <p>Você ainda não cadastrou um endereço de entrega.</p>
        <Link href="/enderecos/novo" className="btn btn-primary mt-3">
          Cadastrar endereço
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    const resposta = await apiCall("/api/pedidos", "POST", { addressId });
    setLoading(false);
    if (!resposta.data) {
      toast.error(resposta.error);
      return setError(resposta.error);
    }
    toast.success("Pedido confirmado!");
    router.push(`/pedidos/${resposta.data.id}?confirmado=1`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError message={error} />
      <fieldset className="space-y-2">
        <legend className="form-label">Endereço de entrega</legend>
        {addresses.map((endereco) => (
          <label key={endereco.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 text-sm">
            <input
              type="radio"
              name="addressId"
              value={endereco.id}
              checked={addressId === endereco.id}
              onChange={() => setAddressId(endereco.id)}
              className="mt-1"
            />
            <span>{endereco.label}</span>
          </label>
        ))}
        <Link href="/enderecos/novo" className="text-sm font-medium text-brand hover:underline">
          + Usar outro endereço
        </Link>
      </fieldset>
      <button type="submit" disabled={loading} className="btn btn-success btn-lg w-full">
        {loading ? "Confirmando..." : "Confirmar pedido"}
      </button>
    </form>
  );
}
