import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { cartService } from "@/lib/cart";

describe("cartService (ligação)", () => {
  it("expõe as operações do carrinho", () => {
    expect(Object.keys(cartService).sort((a, b) => a.localeCompare(b))).toEqual(
      ["add", "clear", "count", "remove", "setQuantity", "view"],
    );
  });
});
