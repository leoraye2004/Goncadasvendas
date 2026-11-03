import { describe, expect, it } from "vitest";
import { formatBRL, formatDateTime, orderCode, STATUS_LABEL } from "@/lib/format";

describe("formatBRL", () => {
  it("formata em reais, com vírgula", () => {
    expect(formatBRL(49.9).replace(/\s/g, " ")).toBe("R$ 49,90");
  });
});

describe("orderCode", () => {
  it("usa os 6 últimos caracteres do id, em maiúsculas", () => {
    expect(orderCode("cmvvegzvb000373u045vox4ct")).toBe("#VOX4CT");
  });
});

describe("formatDateTime", () => {
  it("mostra dia/mês/ano e hora no fuso de Brasília", () => {
    expect(formatDateTime(new Date("2026-11-03T15:30:00Z")).replace(/\s/g, " ")).toMatch(/03\/11\/2026.*12:30/);
  });
});

describe("STATUS_LABEL", () => {
  it("traduz todos os status de pedido", () => {
    expect(STATUS_LABEL).toEqual({
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      SHIPPED: "Enviado",
      DELIVERED: "Entregue",
      CANCELLED: "Cancelado",
    });
  });
});
