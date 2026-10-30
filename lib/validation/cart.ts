import { z } from "zod";

export const MAX_QUANTITY = 99;

const MENSAGEM = `Informe uma quantidade inteira entre 1 e ${MAX_QUANTITY}`;

// UC05 — quantidade de um item. Aceita número ou texto ("3"); vazio, decimal e fora de 1–99 são recusados.
export const quantitySchema = z.preprocess(
  (valor) => (typeof valor === "string" && valor.trim() === "" ? Number.NaN : valor),
  z.coerce.number({ error: MENSAGEM }).int(MENSAGEM).min(1, MENSAGEM).max(MAX_QUANTITY, MENSAGEM),
);
