import { describe, expect, it } from "vitest";
import { failureResponse, NOT_LOGGED_IN } from "@/lib/api-result";
import { formatBRL } from "@/lib/format";

describe("failureResponse", () => {
  it.each([
    ["UNAUTHENTICATED", 401],
    ["FORBIDDEN", 403],
    ["INVALID", 400],
    ["INVALID_IMAGE", 400],
    ["NOT_FOUND", 404],
    ["STORAGE_ERROR", 502],
  ] as const)("%s vira HTTP %i com a mensagem no corpo", async (code, status) => {
    const resposta = failureResponse({ code, message: "algo" });

    expect(resposta.status).toBe(status);
    expect(await resposta.json()).toEqual({ error: "algo" });
  });

  it("NOT_LOGGED_IN responde 401", () => {
    expect(NOT_LOGGED_IN().status).toBe(401);
  });
});

describe("formatBRL", () => {
  it("formata em reais, com vírgula", () => {
    expect(formatBRL(49.9).replace(/\s/g, " ")).toBe("R$ 49,90");
  });
});
