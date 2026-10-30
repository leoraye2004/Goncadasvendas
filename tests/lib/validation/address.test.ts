import { describe, expect, it } from "vitest";
import { addressSchema } from "@/lib/validation/address";

const valido = { cep: "89201-000", street: "Rua XV de Novembro", number: "100", district: "Centro", city: "Joinville", state: "sc" };

describe("addressSchema", () => {
  it("aceita um endereço completo e normaliza CEP e UF", () => {
    const resultado = addressSchema.safeParse({ ...valido, cep: "89201000", state: "sc" });

    expect(resultado.success && resultado.data).toEqual({ ...valido, cep: "89201-000", state: "SC" });
  });

  it("aceita o CEP com traço ou com espaços", () => {
    expect(addressSchema.safeParse({ ...valido, cep: " 89201-000 " }).success).toBe(true);
  });

  it.each(["", "1234567", "123456789", "abcdefgh"])("recusa o CEP %j", (cep) => {
    const resultado = addressSchema.safeParse({ ...valido, cep });

    expect(resultado.success).toBe(false);
  });

  it.each(["street", "number", "district", "city"] as const)("exige %s", (campo) => {
    expect(addressSchema.safeParse({ ...valido, [campo]: "   " }).success).toBe(false);
  });

  it.each(["S", "SCC", ""])("recusa UF %j", (state) => {
    expect(addressSchema.safeParse({ ...valido, state }).success).toBe(false);
  });

  it("recusa textos muito longos", () => {
    expect(addressSchema.safeParse({ ...valido, street: "a".repeat(121) }).success).toBe(false);
  });
});
