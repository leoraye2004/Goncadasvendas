import { z } from "zod";

const soDigitos = (valor: string) => valor.replaceAll(/\D/g, "");

// UC08 — endereço de entrega. O CEP pode vir com ou sem traço; é guardado como 00000-000. A UF vai em maiúsculas.
export const addressSchema = z.object({
  cep: z
    .string()
    .transform(soDigitos)
    .refine((digitos) => digitos.length === 8, "CEP inválido (use 8 números)")
    .transform((digitos) => `${digitos.slice(0, 5)}-${digitos.slice(5)}`),
  street: z.string().trim().min(1, "Informe a rua").max(120, "Rua muito longa"),
  number: z.string().trim().min(1, "Informe o número").max(20, "Número muito longo"),
  district: z.string().trim().min(1, "Informe o bairro").max(80, "Bairro muito longo"),
  city: z.string().trim().min(1, "Informe a cidade").max(80, "Cidade muito longa"),
  state: z
    .string()
    .trim()
    .length(2, "UF deve ter 2 letras")
    .transform((uf) => uf.toUpperCase()),
});

export type AddressInput = z.infer<typeof addressSchema>;
