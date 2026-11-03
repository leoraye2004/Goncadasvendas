"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { apiRequest } from "@/components/api-request";
import { lookupCep } from "@/components/cep-lookup";
import FormError from "@/components/FormError";

export type AddressValues = {
  id: string;
  cep: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
};

const VAZIO = { cep: "", street: "", number: "", district: "", city: "", state: "" };

// UC08 — cadastro e edição de endereço. O CEP preenche o resto pelo ViaCEP; se falhar, é só digitar.
// Quem valida de verdade é o servidor (address-service).
export default function AddressForm({ address }: Readonly<{ address?: AddressValues }>) {
  const router = useRouter();
  const [values, setValues] = useState(address ?? VAZIO);
  const [error, setError] = useState<string>();
  const [cepHint, setCepHint] = useState<string>();
  const [loading, setLoading] = useState(false);

  const change = (campo: keyof typeof VAZIO) => (event: { target: { value: string } }) =>
    setValues((atual) => ({ ...atual, [campo]: event.target.value }));

  async function handleCepBlur() {
    if (values.cep.replaceAll(/\D/g, "").length !== 8) return;
    const achado = await lookupCep(values.cep);
    setCepHint(achado ? undefined : "Não encontramos esse CEP. Pode preencher o endereço manualmente.");
    if (achado) setValues((atual) => ({ ...atual, ...achado }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    const { cep, street, number, district, city, state } = values;
    const corpo = { cep, street, number, district, city, state };
    const erro = address
      ? await apiRequest(`/api/enderecos/${address.id}`, "PUT", corpo)
      : await apiRequest("/api/enderecos", "POST", corpo);
    setLoading(false);
    if (erro) return setError(erro);
    router.push("/enderecos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-4 sm:p-6">
      <FormError message={error} />

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div>
          <label htmlFor="cep" className="form-label">CEP</label>
          <input id="cep" required value={values.cep} onChange={change("cep")} onBlur={handleCepBlur} inputMode="numeric" className="form-control" />
        </div>
        <div>
          <label htmlFor="street" className="form-label">Rua</label>
          <input id="street" required value={values.street} onChange={change("street")} className="form-control" />
        </div>
      </div>
      {cepHint && (
        <p role="status" className="text-sm text-muted">
          {cepHint}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div>
          <label htmlFor="number" className="form-label">Número</label>
          <input id="number" required value={values.number} onChange={change("number")} className="form-control" />
        </div>
        <div>
          <label htmlFor="district" className="form-label">Bairro</label>
          <input id="district" required value={values.district} onChange={change("district")} className="form-control" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="city" className="form-label">Cidade</label>
          <input id="city" required value={values.city} onChange={change("city")} className="form-control" />
        </div>
        <div>
          <label htmlFor="state" className="form-label">UF</label>
          <input id="state" required maxLength={2} value={values.state} onChange={change("state")} className="form-control uppercase" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Salvando..." : "Salvar endereço"}
        </button>
      </div>
    </form>
  );
}
