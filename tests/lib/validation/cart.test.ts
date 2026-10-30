import { describe, expect, it } from "vitest";
import { MAX_QUANTITY, quantitySchema } from "@/lib/validation/cart";

describe("quantitySchema", () => {
  it.each([1, 5, MAX_QUANTITY, "3"])("aceita %s", (valor) => {
    expect(quantitySchema.safeParse(valor).success).toBe(true);
  });

  it.each([0, -1, MAX_QUANTITY + 1, 1.5, "abc", "", undefined, null])("recusa %s", (valor) => {
    expect(quantitySchema.safeParse(valor).success).toBe(false);
  });
});
