import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import AddressForm from "@/components/AddressForm";
import DeleteAddressButton from "@/components/DeleteAddressButton";
import { lookupCep } from "@/components/cep-lookup";

const fetchMock = vi.fn();
const viaCep = { logradouro: "Rua XV de Novembro", bairro: "Centro", localidade: "Joinville", uf: "SC" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("confirm", vi.fn(() => true));
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
});

const preencher = (rotulo: string, valor: string) => fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
const valorDe = (rotulo: string) => (screen.getByLabelText(rotulo) as HTMLInputElement).value;

describe("lookupCep", () => {
  it("devolve rua, bairro, cidade e UF quando o ViaCEP acha o CEP", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => viaCep });

    expect(await lookupCep("89201-000")).toEqual({ street: "Rua XV de Novembro", district: "Centro", city: "Joinville", state: "SC" });
    expect(fetchMock).toHaveBeenCalledWith("https://viacep.com.br/ws/89201000/json/");
  });

  it("não consulta CEP incompleto", async () => {
    expect(await lookupCep("8920")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["CEP inexistente", { ok: true, json: async () => ({ erro: true }) }],
    ["serviço com erro", { ok: false, json: async () => ({}) }],
  ])("devolve null quando há %s", async (_nome, resposta) => {
    fetchMock.mockResolvedValue(resposta);

    expect(await lookupCep("00000-000")).toBeNull();
  });

  it("devolve null se a rede falhar", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));

    expect(await lookupCep("89201000")).toBeNull();
  });
});

describe("AddressForm — busca de CEP", () => {
  it("ao sair do campo CEP, preenche os demais campos", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => viaCep });
    render(<AddressForm />);

    preencher("CEP", "89201000");
    fireEvent.blur(screen.getByLabelText("CEP"));

    await waitFor(() => expect(valorDe("Rua")).toBe("Rua XV de Novembro"));
    expect(valorDe("Bairro")).toBe("Centro");
    expect(valorDe("Cidade")).toBe("Joinville");
    expect(valorDe("UF")).toBe("SC");
  });

  it("se a busca falhar, avisa e deixa preencher à mão (fallback)", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ erro: true }) });
    render(<AddressForm />);

    preencher("CEP", "00000000");
    fireEvent.blur(screen.getByLabelText("CEP"));

    expect((await screen.findByRole("status")).textContent).toContain("manualmente");
    preencher("Rua", "Rua Digitada");
    expect(valorDe("Rua")).toBe("Rua Digitada");
  });

  it("não busca enquanto o CEP está incompleto", () => {
    render(<AddressForm />);

    preencher("CEP", "892");
    fireEvent.blur(screen.getByLabelText("CEP"));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("AddressForm — salvar", () => {
  const completar = () => {
    preencher("CEP", "89201-000");
    preencher("Rua", "Rua A");
    preencher("Número", "10");
    preencher("Bairro", "Centro");
    preencher("Cidade", "Joinville");
    preencher("UF", "SC");
  };

  it("novo endereço: envia POST em JSON e volta para a lista", async () => {
    render(<AddressForm />);
    completar();

    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/enderecos"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/enderecos",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ cep: "89201-000", street: "Rua A", number: "10", district: "Centro", city: "Joinville", state: "SC" }),
      }),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("edição: começa com os dados do endereço e envia PUT", async () => {
    const endereco = { id: "a1", cep: "89201-000", street: "Rua A", number: "10", district: "Centro", city: "Joinville", state: "SC" };
    render(<AddressForm address={endereco} />);
    expect(valorDe("Rua")).toBe("Rua A");

    preencher("Número", "20");
    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/enderecos/a1", expect.objectContaining({ method: "PUT" }));
  });

  it("mostra a mensagem de erro do servidor e não sai da tela", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "CEP inválido (use 8 números)" }) });
    render(<AddressForm />);
    completar();

    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    expect((await screen.findByRole("alert")).textContent).toContain("CEP inválido");
    expect(push).not.toHaveBeenCalled();
  });

  it("mostra erro genérico se a rede falhar", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<AddressForm />);
    completar();

    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível");
  });
});

describe("DeleteAddressButton", () => {
  it("pede confirmação, apaga e recarrega a lista", async () => {
    render(<DeleteAddressButton id="a1" />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/enderecos/a1", expect.objectContaining({ method: "DELETE" }));
  });

  it("se o usuário não confirmar, não apaga", () => {
    vi.stubGlobal("confirm", vi.fn(() => false));
    render(<DeleteAddressButton id="a1" />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("avisa se o servidor recusar", async () => {
    const alerta = vi.fn();
    vi.stubGlobal("alert", alerta);
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Endereço não encontrado" }) });
    render(<DeleteAddressButton id="a1" />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(alerta).toHaveBeenCalledWith("Endereço não encontrado"));
    expect(refresh).not.toHaveBeenCalled();
  });
});
