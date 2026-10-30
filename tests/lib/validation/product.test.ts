import { describe, expect, it } from "vitest";
import { productSchema } from "@/lib/validation/product";

const valido = { name: "Camiseta Básica", category: "Roupas", brand: "GV Basics", price: "49,90" };

describe("productSchema", () => {
  it("aceita um produto válido e entende o preço com vírgula", () => {
    const r = productSchema.safeParse(valido);

    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual({ ...valido, price: 49.9 });
  });

  it("tira espaços das pontas e trata marca vazia como ausente", () => {
    const r = productSchema.safeParse({ ...valido, name: "  Boné  ", brand: "  " });

    expect(r.success && r.data.name).toBe("Boné");
    expect(r.success && r.data.brand).toBeUndefined();
  });

  it.each(["0", "0,00", "-5", "abc", "", "100000"])("recusa o preço %s (RN03: preço maior que zero)", (price) => {
    expect(productSchema.safeParse({ ...valido, price }).success).toBe(false);
  });

  it("recusa preço com mais de duas casas decimais", () => {
    expect(productSchema.safeParse({ ...valido, price: "10,999" }).success).toBe(false);
  });

  it("recusa nome curto e categoria vazia, com mensagem em português", () => {
    const r = productSchema.safeParse({ ...valido, name: "A", category: "" });

    expect(r.success).toBe(false);
    if (!r.success) {
      const mensagens = r.error.issues.map((i) => i.message);
      expect(mensagens).toContain("Informe o nome (mínimo 2 letras)");
      expect(mensagens).toContain("Informe a categoria");
    }
  });
});
