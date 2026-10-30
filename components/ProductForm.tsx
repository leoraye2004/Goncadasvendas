"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import FormError from "@/components/FormError";

export type ProductFormValues = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: string;
  images: { id: string; url: string }[];
};

const CATEGORIAS = ["Roupas", "Calçados", "Acessórios"];

const textoDoBotao = (product?: ProductFormValues) => (product ? "Salvar alterações" : "Cadastrar produto");

// UC03 — cadastro e edição de produto (com várias imagens). As regras ficam no servidor (product-service).
export default function ProductForm({ product }: Readonly<{ product?: ProductFormValues }>) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const rotuloDoBotao = loading ? "Salvando..." : textoDoBotao(product);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const resposta = await fetch(product ? `/api/admin/produtos/${product.id}` : "/api/admin/produtos", {
        method: product ? "PUT" : "POST",
        body: new FormData(event.currentTarget),
      });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        setError(corpo.error ?? "Não foi possível salvar o produto. Tente novamente.");
        return;
      }
      router.push("/admin/produtos");
      router.refresh();
    } catch {
      setError("Não foi possível salvar o produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-4 sm:p-6">
      <FormError message={error} />

      <div>
        <label htmlFor="name" className="form-label">Nome</label>
        <input id="name" name="name" required defaultValue={product?.name} className="form-control" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="form-label">Categoria</label>
          <input id="category" name="category" list="categorias" required defaultValue={product?.category} className="form-control" />
          <datalist id="categorias">
            {CATEGORIAS.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor="brand" className="form-label">Marca</label>
          <input id="brand" name="brand" defaultValue={product?.brand} className="form-control" />
        </div>
      </div>

      <div className="sm:max-w-xs">
        <label htmlFor="price" className="form-label">Preço (R$)</label>
        <input id="price" name="price" inputMode="decimal" required placeholder="49,90" defaultValue={product?.price} className="form-control" />
      </div>

      {product && product.images.length > 0 && (
        <fieldset>
          <legend className="form-label">Imagens atuais (marque para remover)</legend>
          <div className="flex flex-wrap gap-3">
            {product.images.map((imagem) => (
              <label key={imagem.id} className="block w-24 text-center text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element -- as imagens vêm do Blob (domínio externo) */}
                <img src={imagem.url} alt="" className="h-24 w-24 rounded-lg border border-line object-cover" />
                <input type="checkbox" name="removeImageIds" value={imagem.id} className="mt-1" />
                <span className="ml-1">Remover</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="imagens" className="form-label">
          {product ? "Adicionar imagens" : "Imagens"} (JPG, PNG ou WebP, até 5 MB cada)
        </label>
        <input id="imagens" name="imagens" type="file" multiple accept="image/jpeg,image/png,image/webp" className="form-control" />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {rotuloDoBotao}
        </button>
        <button type="button" onClick={() => router.push("/admin/produtos")} className="btn btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
