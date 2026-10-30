import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { ProductRepository } from "@/repositories/product-repository";
import { createCatalogService } from "@/services/catalog-service";

const produto = (id: string, category: string, price: number, active = true) =>
  ({ id, name: `Produto ${id}`, category, brand: null, price, active, images: [] }) as never;

let repo: ReturnType<typeof mock<ProductRepository>>;
let service: ReturnType<typeof createCatalogService>;

beforeEach(() => {
  repo = mock<ProductRepository>();
  repo.list.mockResolvedValue([
    produto("1", "Roupas", 49.9),
    produto("2", "Calçados", 199.9),
    produto("3", "Roupas", 129.9),
    produto("4", "Acessórios", 0), // RN03: preço zero não aparece
    produto("5", "Perfumes", 80, false), // inativo não aparece
  ]);
  service = createCatalogService(repo);
});

describe("catalogService.browse", () => {
  it("mostra só produtos ativos com preço maior que zero (RN03)", async () => {
    const { products } = await service.browse();

    expect(products.map((p) => p.id)).toEqual(["1", "2", "3"]);
  });

  it("lista só as categorias que têm produto visível, em ordem alfabética", async () => {
    const { categories } = await service.browse();

    expect(categories).toEqual(["Calçados", "Roupas"]);
  });

  it("filtra pela categoria escolhida", async () => {
    const r = await service.browse("Roupas");

    expect(r.selected).toBe("Roupas");
    expect(r.products.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("ignora uma categoria que não existe e mostra tudo", async () => {
    const r = await service.browse("Inventada");

    expect(r.selected).toBeUndefined();
    expect(r.products).toHaveLength(3);
  });

  it("não deixa filtrar por uma categoria que só tem produto escondido", async () => {
    const r = await service.browse("Acessórios");

    expect(r.selected).toBeUndefined();
    expect(r.products).toHaveLength(3);
  });
});

describe("catalogService.detail", () => {
  it("devolve o produto visível", async () => {
    repo.findById.mockResolvedValue(produto("1", "Roupas", 49.9));

    expect(await service.detail("1")).toMatchObject({ id: "1" });
  });

  it.each([
    ["não existe", null],
    ["está inativo", produto("5", "Perfumes", 80, false)],
    ["tem preço zero (RN03)", produto("4", "Acessórios", 0)],
  ])("devolve null quando o produto %s", async (_nome, encontrado) => {
    repo.findById.mockResolvedValue(encontrado);

    expect(await service.detail("x")).toBeNull();
  });
});
