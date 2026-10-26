import { describe, expect, it } from "vitest";
import { isValidCpf, registerUserSchema } from "@/lib/validation/user";

// CPF de teste com dígitos verificadores corretos.
const CPF_VALIDO = "52998224725";

const dadosValidos = {
  name: "Ana Souza",
  email: "ana@example.com",
  cpf: CPF_VALIDO,
  birthDate: "1990-05-20",
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

  it("converte a data de nascimento para Date", () => {
    const result = registerUserSchema.parse(dadosValidos);

    expect(result.birthDate).toBeInstanceOf(Date);
    expect(result.birthDate.toISOString().slice(0, 10)).toBe("1990-05-20");
  });

  it("rejeita data de nascimento impossível, futura, antiga demais ou que não é data", () => {
    for (const birthDate of ["1990-02-31", "2999-01-01", "1850-01-01", "ontem", ""]) {
      const result = registerUserSchema.safeParse({ ...dadosValidos, birthDate });
      expect(result.success, `deveria rejeitar "${birthDate}"`).toBe(false);
    }
  });

  it("rejeita nome vazio", () => {
    const result = registerUserSchema.safeParse({ ...dadosValidos, name: "  " });
    expect(result.success).toBe(false);
  });
});
