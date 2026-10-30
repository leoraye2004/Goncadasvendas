import { z } from "zod";

// O formulário manda texto ("49,90"). Troca a vírgula por ponto antes de virar número.
const preco = z.preprocess(
  (valor) => (typeof valor === "string" ? valor.trim().replace(",", ".") : valor),
  z
    .coerce.number({ error: "Informe um preço válido" })
    .refine((n) => n > 0, "O preço deve ser maior que zero")
    .refine((n) => n <= 99999.99, "O preço máximo é 99.999,99")
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, "Use no máximo duas casas decimais"),
);

// UC03 — dados de um produto. RN03: o preço precisa ser maior que zero.
export const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome (mínimo 2 letras)").max(120, "Nome muito longo"),
  category: z.string().trim().min(2, "Informe a categoria").max(60, "Categoria muito longa"),
  brand: z
    .string()
    .trim()
    .max(60, "Marca muito longa")
    .optional()
    .transform((valor) => valor || undefined),
  price: preco,
});

export type ProductInput = z.infer<typeof productSchema>;
