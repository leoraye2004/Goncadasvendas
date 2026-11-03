import { describe, expect, it } from "vitest";
import { NEXT_STATUS } from "@/lib/order-status";

describe("NEXT_STATUS", () => {
  it("segue o caminho Pendente → Confirmado → Enviado → Entregue, com cancelamento até o envio", () => {
    expect(NEXT_STATUS).toEqual({
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    });
  });
});
