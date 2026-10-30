import { beforeEach, describe, expect, it, vi } from "vitest";

const { uploadData, getBlockBlobClient, fromConnectionString } = vi.hoisted(() => {
  const uploadData = vi.fn().mockResolvedValue({});
  const getBlockBlobClient = vi.fn((nome: string) => ({ uploadData, url: `https://conta.blob/product-images/${nome}` }));
  const fromConnectionString = vi.fn(() => ({ getContainerClient: () => ({ getBlockBlobClient }) }));
  return { uploadData, getBlockBlobClient, fromConnectionString };
});

vi.mock("@azure/storage-blob", () => ({ BlobServiceClient: { fromConnectionString } }));

import { createBlobStorage } from "@/lib/blob-storage";

const arquivo = { name: "Foto Bonita.PNG", type: "image/png", size: 3, bytes: new Uint8Array([1, 2, 3]) };

beforeEach(() => vi.clearAllMocks());

describe("blobStorage", () => {
  it("envia o arquivo com o tipo certo e devolve a URL pública", async () => {
    const url = await createBlobStorage("conexao").upload(arquivo);

    expect(fromConnectionString).toHaveBeenCalledWith("conexao");
    expect(uploadData).toHaveBeenCalledWith(arquivo.bytes, { blobHTTPHeaders: { blobContentType: "image/png" } });
    expect(url).toMatch(/^https:\/\/conta\.blob\/product-images\/[0-9a-f-]{36}\.png$/);
  });

  it("dá um nome único a cada envio (nunca usa o nome que o usuário mandou)", async () => {
    const storage = createBlobStorage("conexao");

    await storage.upload(arquivo);
    await storage.upload(arquivo);

    const [primeiro, segundo] = getBlockBlobClient.mock.calls.map(([nome]) => nome);
    expect(primeiro).not.toBe(segundo);
    expect(primeiro).not.toContain("Bonita");
  });

  it("explica o problema quando o armazenamento não está configurado", async () => {
    await expect(createBlobStorage(undefined).upload(arquivo)).rejects.toThrow("Armazenamento de imagens não configurado");
    expect(uploadData).not.toHaveBeenCalled();
  });
});
