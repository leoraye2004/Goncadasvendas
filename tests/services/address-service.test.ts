import { beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { AddressRepository } from "@/repositories/address-repository";
import { createAddressService } from "@/services/address-service";

const cliente = { id: "u1", role: "CUSTOMER" } as const;
const entrada = { cep: "89201000", street: "Rua A", number: "10", district: "Centro", city: "Joinville", state: "sc" };
const normalizado = { cep: "89201-000", street: "Rua A", number: "10", district: "Centro", city: "Joinville", state: "SC" };

let repo: ReturnType<typeof mock<AddressRepository>>;
let service: ReturnType<typeof createAddressService>;

beforeEach(() => {
  repo = mock<AddressRepository>();
  service = createAddressService(repo);
});

describe("RN01 — endereços só para usuário autenticado", () => {
  it.each([
    ["list", () => service.list(null)],
    ["get", () => service.get(null, "a1")],
    ["create", () => service.create(null, entrada)],
    ["update", () => service.update(null, "a1", entrada)],
    ["remove", () => service.remove(null, "a1")],
  ])("%s sem login devolve UNAUTHENTICATED e não toca no banco", async (_nome, chamar) => {
    expect(await chamar()).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
    expect(repo.list).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
    expect(repo.remove).not.toHaveBeenCalled();
  });
});

describe("addressService.list e get", () => {
  it("lista os endereços do usuário logado", async () => {
    repo.list.mockResolvedValue([{ id: "a1" }] as never);

    const resultado = await service.list(cliente);

    expect(repo.list).toHaveBeenCalledWith("u1");
    expect(resultado).toEqual({ ok: true, data: [{ id: "a1" }] });
  });

  it("get devolve o endereço do próprio usuário", async () => {
    repo.findOwned.mockResolvedValue({ id: "a1" } as never);

    expect(await service.get(cliente, "a1")).toEqual({ ok: true, data: { id: "a1" } });
    expect(repo.findOwned).toHaveBeenCalledWith("u1", "a1");
  });

  it("get de endereço que não é do usuário dá NOT_FOUND", async () => {
    repo.findOwned.mockResolvedValue(null);

    expect(await service.get(cliente, "a-de-outro")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});

describe("addressService.create", () => {
  it("valida, normaliza e grava para o usuário logado", async () => {
    repo.create.mockResolvedValue({ id: "a9" } as never);

    const resultado = await service.create(cliente, entrada);

    expect(repo.create).toHaveBeenCalledWith("u1", normalizado);
    expect(resultado).toEqual({ ok: true, data: { id: "a9" } });
  });

  it("dados inválidos dão INVALID com a primeira mensagem e não gravam", async () => {
    const resultado = await service.create(cliente, { ...entrada, cep: "123" });

    expect(resultado).toMatchObject({ ok: false, code: "INVALID", message: "CEP inválido (use 8 números)" });
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe("addressService.update", () => {
  it("altera o endereço do próprio usuário", async () => {
    repo.update.mockResolvedValue(1);

    expect((await service.update(cliente, "a1", entrada)).ok).toBe(true);
    expect(repo.update).toHaveBeenCalledWith("u1", "a1", normalizado);
  });

  it("endereço de outro usuário (ou inexistente) dá NOT_FOUND", async () => {
    repo.update.mockResolvedValue(0);

    expect(await service.update(cliente, "a-de-outro", entrada)).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("dados inválidos nem chegam ao banco", async () => {
    expect(await service.update(cliente, "a1", { ...entrada, state: "X" })).toMatchObject({ ok: false, code: "INVALID" });
    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe("addressService.remove", () => {
  it("remove o endereço do próprio usuário", async () => {
    repo.remove.mockResolvedValue(1);

    expect((await service.remove(cliente, "a1")).ok).toBe(true);
    expect(repo.remove).toHaveBeenCalledWith("u1", "a1");
  });

  it("endereço de outro usuário dá NOT_FOUND", async () => {
    repo.remove.mockResolvedValue(0);

    expect(await service.remove(cliente, "a-de-outro")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});
