import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { productService } from "@/lib/products";

describe("productService (ligação com o banco)", () => {
  it("expõe as operações do CRUD", () => {
    for (const nome of ["list", "get", "create", "update", "remove"] as const) {
      expect(typeof productService[nome]).toBe("function");
    }
  });
});
