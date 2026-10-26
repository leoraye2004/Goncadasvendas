import { describe, expect, it } from "vitest";
import { isValidCpf, registerUserSchema } from "@/lib/validation/user";

// CPF de teste com dígitos verificadores corretos.
const CPF_VALIDO = "52998224725";

const dadosValidos = {
  name: "Ana Souza",
  email: "ana@example.com",
  cpf: CPF_VALIDO,
  password: "senha1234",
};

describe("isValidCpf", () => {
  it("aceita um CPF válido, com ou sem máscara", () => {
    expect(isValidCpf(CPF_VALIDO)).toBe(true);
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("rejeita tamanho errado, dígitos repetidos e dígito verificador errado", () => {
    expect(isValidCpf("123")).toBe(false);
    expect(isValidCpf("11111111111")).toBe(false);
    expect(isValidCpf("52998224726")).toBe(false);
  });
});

describe("registerUserSchema", () => {
  it("aceita dados válidos e normaliza e-mail e CPF", () => {
    const result = registerUserSchema.parse({
      ...dadosValidos,
      email: "  Ana@Example.COM ",
      cpf: "529.982.247-25",
    });

    expect(result.email).toBe("ana@example.com");
    expect(result.cpf).toBe(CPF_VALIDO);
  });

  it("rejeita e-mail inválido", () => {
    const result = registerUserSchema.safeParse({ ...dadosValidos, email: "nao-e-email" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha com menos de 8 caracteres", () => {
    const result = registerUserSchema.safeParse({ ...dadosValidos, password: "curta" });
    expect(result.success).toBe(false);
  });

  it("rejeita CPF inválido com mensagem clara", () => {
    const result = registerUserSchema.safeParse({ ...dadosValidos, cpf: "52998224726" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe("CPF inválido");
  });

  it("rejeita nome vazio", () => {
    const result = registerUserSchema.safeParse({ ...dadosValidos, name: "  " });
    expect(result.success).toBe(false);
  });
});
