import type { Role } from "@prisma/client";
import { productSchema } from "@/lib/validation/product";
import type { ProductRepository } from "@/repositories/product-repository";

export type Actor = { id: string; role: Role };
export type UploadFile = { name: string; type: string; size: number; bytes: Uint8Array };
export type ImageStorage = { upload(arquivo: UploadFile): Promise<string> };

type Failure = {
  ok: false;
  code: "FORBIDDEN" | "INVALID" | "INVALID_IMAGE" | "NOT_FOUND" | "STORAGE_ERROR";
  message: string;
};
export type Result<T> = { ok: true; data: T } | Failure;

const TIPOS = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_IMAGENS = 6; // RF11: várias imagens por produto

const falha = (code: Failure["code"], message: string): Failure => ({ ok: false, code, message });
const SEM_PERMISSAO = falha("FORBIDDEN", "Apenas administradores podem gerenciar produtos");
const NAO_ENCONTRADO = falha("NOT_FOUND", "Produto não encontrado");

function erroDeImagem(novas: UploadFile[], jaExistem: number): Failure | null {
  if (jaExistem + novas.length > MAX_IMAGENS) return falha("INVALID_IMAGE", `Cada produto aceita no máximo ${MAX_IMAGENS} imagens`);
  for (const arquivo of novas) {
    if (!TIPOS.has(arquivo.type)) return falha("INVALID_IMAGE", "Envie imagens JPG, PNG ou WebP");
    if (arquivo.size > MAX_BYTES) return falha("INVALID_IMAGE", "Cada imagem pode ter no máximo 5 MB");
  }
  return null;
}

// Regras de UC03 (gerenciar produtos), RN03 (preço > 0) e RN05 (só ADMIN). O service confere o papel
// mesmo com o middleware na frente: quem protege os dados não pode depender só da tela.
export function createProductService(products: ProductRepository, storage: ImageStorage) {
  const isAdmin = (actor: Actor) => actor.role === "ADMIN";

  async function enviar(arquivos: UploadFile[]): Promise<string[] | Failure> {
    try {
      return await Promise.all(arquivos.map((arquivo) => storage.upload(arquivo)));
    } catch {
      return falha("STORAGE_ERROR", "Não foi possível enviar as imagens. Tente novamente.");
    }
  }

  return {
    async list(actor: Actor) {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      return { ok: true, data: await products.list() } as const;
    },

    async get(actor: Actor, id: string) {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      const produto = await products.findById(id);
      return produto ? ({ ok: true, data: produto } as const) : NAO_ENCONTRADO;
    },

    async create(actor: Actor, input: unknown, arquivos: UploadFile[]) {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      const dados = productSchema.safeParse(input);
      if (!dados.success) return falha("INVALID", dados.error.issues[0]?.message ?? "Dados inválidos");
      const problema = erroDeImagem(arquivos, 0);
      if (problema) return problema;

      const urls = await enviar(arquivos);
      if (!Array.isArray(urls)) return urls;
      return { ok: true, data: await products.create({ ...dados.data, imageUrls: urls }) } as const;
    },

    async update(actor: Actor, id: string, input: unknown, arquivos: UploadFile[], removeImageIds: string[]) {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      const atual = await products.findById(id);
      if (!atual) return NAO_ENCONTRADO;
      const dados = productSchema.safeParse(input);
      if (!dados.success) return falha("INVALID", dados.error.issues[0]?.message ?? "Dados inválidos");

      const restantes = atual.images.filter((imagem) => !removeImageIds.includes(imagem.id)).length;
      const problema = erroDeImagem(arquivos, restantes);
      if (problema) return problema;

      const urls = await enviar(arquivos);
      if (!Array.isArray(urls)) return urls;
      return { ok: true, data: await products.update(id, { ...dados.data, imageUrls: urls, removeImageIds }) } as const;
    },

    // Quem já foi pedido não pode sumir do histórico (os pedidos apontam para ele): só fica inativo.
    async remove(actor: Actor, id: string): Promise<Result<"DELETED" | "DEACTIVATED">> {
      if (!isAdmin(actor)) return SEM_PERMISSAO;
      if (!(await products.findById(id))) return NAO_ENCONTRADO;

      if ((await products.countOrderItems(id)) > 0) {
        await products.deactivate(id);
        return { ok: true, data: "DEACTIVATED" };
      }
      await products.remove(id);
      return { ok: true, data: "DELETED" };
    },
  };
}

export type ProductService = ReturnType<typeof createProductService>;
