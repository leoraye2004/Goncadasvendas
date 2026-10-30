import type { UploadFile } from "@/services/product-service";

// Campos de texto do formulário de produto, do jeito que o service espera.
export function productFields(form: FormData) {
  const texto = (nome: string) => String(form.get(nome) ?? "");
  return { name: texto("name"), category: texto("category"), brand: texto("brand"), price: texto("price") };
}

// Arquivos enviados num campo. Um campo de arquivo sem escolha chega como File vazio: é ignorado.
export async function filesOf(form: FormData, campo: string): Promise<UploadFile[]> {
  const arquivos = form.getAll(campo).filter((v): v is File => typeof v !== "string" && v.size > 0);
  return Promise.all(
    arquivos.map(async (arquivo) => ({
      name: arquivo.name,
      type: arquivo.type,
      size: arquivo.size,
      bytes: new Uint8Array(await arquivo.arrayBuffer()),
    })),
  );
}

export function idsOf(form: FormData, campo: string): string[] {
  return form.getAll(campo).filter((v): v is string => typeof v === "string");
}
