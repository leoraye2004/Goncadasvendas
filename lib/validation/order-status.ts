import { z } from "zod";

export const orderStatusSchema = z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"], {
  error: "Status inválido",
});
