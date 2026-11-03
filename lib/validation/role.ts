import { z } from "zod";

// Papéis que o admin pode atribuir (mesmos valores do enum Role do banco).
export const roleSchema = z.enum(["ADMIN", "CUSTOMER"], { error: "Papel inválido" });
