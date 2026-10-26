import { z } from "zod";

const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

/**
 * Valida o CPF pelos dois dígitos verificadores. Aceita com ou sem máscara.
 * Rejeita sequências repetidas (111.111.111-11), que passam na conta mas não existem.
 */
export function isValidCpf(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digitoVerificador = (quantidade: number) => {
    let soma = 0;
    for (let i = 0; i < quantidade; i++) soma += Number(cpf[i]) * (quantidade + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return digitoVerificador(9) === Number(cpf[9]) && digitoVerificador(10) === Number(cpf[10]);
}

// UC01 — cadastro de usuário. O CPF fica só com dígitos e o e-mail em minúsculas.
export const registerUserSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(100, "Nome muito longo"),
  email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido")),
  cpf: z
    .string()
    .transform(somenteDigitos)
    .refine(isValidCpf, "CPF inválido"),
  // 72 é o limite do bcrypt: acima disso o hash ignora o resto da senha.
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
