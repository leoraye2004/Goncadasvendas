"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { apiRequest } from "@/components/api-request";
import FormError from "@/components/FormError";
import { STATUS_LABEL } from "@/lib/format";
import { NEXT_STATUS, type OrderStatusName } from "@/lib/order-status";

// UC10 — o admin escolhe o próximo status do pedido. Só aparecem as opções válidas (o service confere de novo).
export default function OrderStatusForm({ id, status }: Readonly<{ id: string; status: OrderStatusName }>) {
  const router = useRouter();
  const opcoes = NEXT_STATUS[status];
  const [novo, setNovo] = useState(opcoes[0]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  if (opcoes.length === 0) return <p className="text-sm text-muted">Este pedido não tem próximas etapas.</p>;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    const erro = await apiRequest(`/api/admin/pedidos/${id}`, "PATCH", { status: novo });
    setLoading(false);
    if (erro) return setError(erro);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormError message={error} />
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="novo-status" className="sr-only">
          Novo status
        </label>
        <select
          id="novo-status"
          value={novo}
          onChange={(event) => setNovo(event.target.value as OrderStatusName)}
          className="form-control w-auto"
        >
          {opcoes.map((opcao) => (
            <option key={opcao} value={opcao}>
              {STATUS_LABEL[opcao]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Atualizando..." : "Atualizar status"}
        </button>
      </div>
    </form>
  );
}
