import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { orderService } from "@/lib/orders";

describe("orderService (ligação)", () => {
  it("expõe as operações de pedido", () => {
    expect(Object.keys(orderService).sort((a, b) => a.localeCompare(b))).toEqual(["checkout", "get", "list"]);
  });
});
