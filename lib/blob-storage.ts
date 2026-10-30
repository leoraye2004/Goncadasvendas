import { randomUUID } from "node:crypto";
import { BlobServiceClient } from "@azure/storage-blob";
import type { ImageStorage, UploadFile } from "@/services/product-service";

const CONTAINER = "product-images";

// Cria o armazenamento de imagens no Azure Blob. Sem a connection string o app roda normalmente;
// só o envio de imagem falha, com uma mensagem clara (o service transforma em STORAGE_ERROR).
export function createBlobStorage(connectionString: string | undefined): ImageStorage {
  return {
    async upload(arquivo: UploadFile) {
      if (!connectionString) throw new Error("Armazenamento de imagens não configurado");

      // Nome novo e aleatório: não confiamos no nome do arquivo que o usuário mandou.
      const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "img";
      const blob = BlobServiceClient.fromConnectionString(connectionString)
        .getContainerClient(CONTAINER)
        .getBlockBlobClient(`${randomUUID()}.${extensao}`);

      await blob.uploadData(arquivo.bytes, { blobHTTPHeaders: { blobContentType: arquivo.type } });
      return blob.url;
    },
  };
}
