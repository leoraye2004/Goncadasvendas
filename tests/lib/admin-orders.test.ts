import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { adminOrderService } from "@/lib/admin-orders";

describe("adminOrderService (ligação)", () => {
  it("expõe as operações de administração de pedidos", () => {
    expect(Object.keys(adminOrderService).sort((a, b) => a.localeCompare(b))).toEqual(["get", "list", "setStatus"]);
  });
});
