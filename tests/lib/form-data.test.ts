import { describe, expect, it } from "vitest";
import { filesOf, idsOf, productFields } from "@/lib/form-data";

function formulario() {
  const form = new FormData();
  form.set("name", "Boné");
  form.set("category", "Acessórios");
  form.set("price", "39,90");
  form.append("imagens", new File([new Uint8Array([1, 2, 3])], "a.png", { type: "image/png" }));
  form.append("imagens", new File([], "", { type: "application/octet-stream" })); // campo sem escolha
  form.append("removeImageIds", "i1");
  form.append("removeImageIds", "i2");
  return form;
}

describe("form-data", () => {
  it("productFields devolve texto, com vazio para o que faltou", () => {
    expect(productFields(formulario())).toEqual({ name: "Boné", category: "Acessórios", brand: "", price: "39,90" });
  });

  it("filesOf lê os arquivos e ignora o campo vazio", async () => {
    const arquivos = await filesOf(formulario(), "imagens");

    expect(arquivos).toHaveLength(1);
    expect(arquivos[0]).toMatchObject({ name: "a.png", type: "image/png", size: 3 });
    expect(Array.from(arquivos[0].bytes)).toEqual([1, 2, 3]);
  });

  it("idsOf junta todos os valores de texto do campo", () => {
    expect(idsOf(formulario(), "removeImageIds")).toEqual(["i1", "i2"]);
  });
});
