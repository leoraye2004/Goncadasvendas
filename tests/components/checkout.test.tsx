import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import CheckoutForm from "@/components/CheckoutForm";

const fetchMock = vi.fn();
const enderecos = [
  { id: "a1", label: "Rua A, 10 — Centro, Joinville/SC — CEP 89201-000" },
  { id: "a2", label: "Rua B, 20 — Bela Vista, Blumenau/SC — CEP 89010-000" },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: "o1" }) });
});

describe("CheckoutForm", () => {
  it("lista os endereços e já vem com o primeiro escolhido", () => {
    render(<CheckoutForm addresses={enderecos} />);

    expect((screen.getByLabelText(enderecos[0].label) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(enderecos[1].label) as HTMLInputElement).checked).toBe(false);
  });

  it("confirma o pedido com o endereço escolhido e vai para a tela do pedido", async () => {
    render(<CheckoutForm addresses={enderecos} />);

    fireEvent.click(screen.getByLabelText(enderecos[1].label));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/pedidos/o1?confirmado=1"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pedidos",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ addressId: "a2" }) }),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("mostra a mensagem de erro do servidor e fica na tela", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Seu carrinho está vazio" }) });
    render(<CheckoutForm addresses={enderecos} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Seu carrinho está vazio");
    expect(push).not.toHaveBeenCalled();
  });

  it("sem endereço, convida a cadastrar um e não mostra o botão de confirmar", () => {
    render(<CheckoutForm addresses={[]} />);

    expect(screen.getByRole("link", { name: "Cadastrar endereço" }).getAttribute("href")).toBe("/enderecos/novo");
    expect(screen.queryByRole("button", { name: "Confirmar pedido" })).toBeNull();
  });
});
