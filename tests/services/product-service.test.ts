import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { ProductRepository } from "@/repositories/product-repository";
import { createProductService, type ImageStorage, type UploadFile } from "@/services/product-service";

const admin = { id: "a1", role: "ADMIN" as const };
const cliente = { id: "c1", role: "CUSTOMER" as const };
const dados = { name: "Camiseta", category: "Roupas", brand: "GV", price: "49,90" };

const imagem = (overrides: Partial<UploadFile> = {}): UploadFile => ({
  name: "foto.png",
  type: "image/png",
  size: 1000,
  bytes: new Uint8Array([1, 2, 3]),
  ...overrides,
});

const produto = (id = "p1", imagens: { id: string; url: string }[] = []) =>
  ({ id, name: "Camiseta", category: "Roupas", brand: "GV", price: 49.9, active: true, images: imagens }) as never;

let repo: ReturnType<typeof mock<ProductRepository>>;
let storage: ReturnType<typeof mock<ImageStorage>>;
let service: ReturnType<typeof createProductService>;

beforeEach(() => {
  repo = mock<ProductRepository>();
  storage = mock<ImageStorage>();
  storage.upload.mockResolvedValue("https://blob/img.png");
  repo.create.mockResolvedValue(produto());
  repo.update.mockResolvedValue(produto());
  service = createProductService(repo, storage);
});

describe("productService — acesso (RN05)", () => {
  it("só ADMIN faz qualquer operação", async () => {
    const respostas = [
      await service.list(cliente),
      await service.get(cliente, "p1"),
      await service.create(cliente, dados, []),
      await service.update(cliente, "p1", dados, [], []),
      await service.remove(cliente, "p1"),
    ];

    for (const r of respostas) expect(r).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.remove).not.toHaveBeenCalled();
  });
});

describe("productService — criar", () => {
  it("envia as imagens ao armazenamento e grava o produto com as URLs", async () => {
    const r = await service.create(admin, dados, [imagem(), imagem({ name: "b.webp", type: "image/webp" })]);

    expect(r.ok).toBe(true);
    expect(storage.upload).toHaveBeenCalledTimes(2);
    expect(repo.create).toHaveBeenCalledWith({
      name: "Camiseta",
      category: "Roupas",
      brand: "GV",
      price: 49.9,
      imageUrls: ["https://blob/img.png", "https://blob/img.png"],
    });
  });

  it("recusa preço zero (RN03) e não grava nada", async () => {
    const r = await service.create(admin, { ...dados, price: "0" }, [imagem()]);

    expect(r).toMatchObject({ ok: false, code: "INVALID" });
    expect(storage.upload).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });

  it.each([
    ["tipo que não é imagem", imagem({ type: "application/pdf" })],
    ["arquivo maior que 5 MB", imagem({ size: 5 * 1024 * 1024 + 1 })],
  ])("recusa %s antes de enviar qualquer coisa", async (_nome, arquivo) => {
    const r = await service.create(admin, dados, [imagem(), arquivo]);

    expect(r).toMatchObject({ ok: false, code: "INVALID_IMAGE" });
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it("recusa mais de 6 imagens por produto (RF11)", async () => {
    const r = await service.create(admin, dados, Array.from({ length: 7 }, () => imagem()));

    expect(r).toMatchObject({ ok: false, code: "INVALID_IMAGE" });
  });

  it("devolve STORAGE_ERROR quando o envio falha e não grava o produto", async () => {
    storage.upload.mockRejectedValue(new Error("sem conexão"));

    const r = await service.create(admin, dados, [imagem()]);

    expect(r).toMatchObject({ ok: false, code: "STORAGE_ERROR" });
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe("productService — editar", () => {
  it("devolve NOT_FOUND quando o produto não existe", async () => {
    repo.findById.mockResolvedValue(null);

    expect(await service.update(admin, "x", dados, [], [])).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("atualiza os dados, acrescenta imagens novas e remove as marcadas", async () => {
    repo.findById.mockResolvedValue(produto("p1", [{ id: "i1", url: "u1" }]));

    const r = await service.update(admin, "p1", dados, [imagem()], ["i1"]);

    expect(r.ok).toBe(true);
    expect(repo.update).toHaveBeenCalledWith("p1", {
      name: "Camiseta",
      category: "Roupas",
      brand: "GV",
      price: 49.9,
      imageUrls: ["https://blob/img.png"],
      removeImageIds: ["i1"],
    });
  });

  it("conta as imagens que já existem no limite de 6", async () => {
    const seis = Array.from({ length: 6 }, (_, i) => ({ id: `i${i}`, url: `u${i}` }));
    repo.findById.mockResolvedValue(produto("p1", seis));

    const r = await service.update(admin, "p1", dados, [imagem()], []);

    expect(r).toMatchObject({ ok: false, code: "INVALID_IMAGE" });
    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe("productService — excluir", () => {
  it("apaga de vez quando nunca foi pedido", async () => {
    repo.findById.mockResolvedValue(produto());
    repo.countOrderItems.mockResolvedValue(0);

    const r = await service.remove(admin, "p1");

    expect(r).toEqual({ ok: true, data: "DELETED" });
    expect(repo.remove).toHaveBeenCalledWith("p1");
  });

  it("só desativa quando já existe pedido com o produto (RN04 vale também para o histórico)", async () => {
    repo.findById.mockResolvedValue(produto());
    repo.countOrderItems.mockResolvedValue(2);

    const r = await service.remove(admin, "p1");

    expect(r).toEqual({ ok: true, data: "DEACTIVATED" });
    expect(repo.deactivate).toHaveBeenCalledWith("p1");
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it("devolve NOT_FOUND quando o produto não existe", async () => {
    repo.findById.mockResolvedValue(null);

    expect(await service.remove(admin, "x")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});

describe("productService — consultar", () => {
  it("lista e busca um produto para o admin", async () => {
    repo.list.mockResolvedValue([produto()]);
    repo.findById.mockResolvedValue(produto());

    expect(await service.list(admin)).toMatchObject({ ok: true });
    expect(await service.get(admin, "p1")).toMatchObject({ ok: true });
  });

  it("get devolve NOT_FOUND quando o produto não existe", async () => {
    repo.findById.mockResolvedValue(null);

    expect(await service.get(admin, "x")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});
