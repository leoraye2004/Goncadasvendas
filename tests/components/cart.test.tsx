import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import AddToCartButton from "@/components/AddToCartButton";
import CartItemRow from "@/components/CartItemRow";
import ClearCartButton from "@/components/ClearCartButton";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("confirm", vi.fn(() => true));
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
});

const item = { id: "i1", productId: "p1", name: "Camiseta", unitPrice: 19.9, quantity: 3, lineTotal: 59.7, imageUrl: "https://blob/a.png" };

describe("AddToCartButton", () => {
  it("visitante vê um convite para entrar, sem botão de comprar (RN01)", () => {
    render(<AddToCartButton productId="p1" loggedIn={false} />);

    expect(screen.getByRole("link", { name: "Entrar para comprar" }).getAttribute("href")).toBe("/login");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("logado envia produto e quantidade e confirma", async () => {
    render(<AddToCartButton productId="p1" loggedIn />);

    fireEvent.change(screen.getByLabelText("Quantidade"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar ao carrinho" }));

    expect((await screen.findByRole("status")).textContent).toContain("Adicionado ao carrinho");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/carrinho",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ productId: "p1", quantity: "2" }) }),
    );
    expect(screen.getByRole("link", { name: "Ver carrinho" }).getAttribute("href")).toBe("/carrinho");
    expect(refresh).toHaveBeenCalled();
  });

  it("mostra a mensagem de erro que vem do servidor", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "O máximo é 99 unidades por produto" }) });
    render(<AddToCartButton productId="p1" loggedIn />);

    fireEvent.click(screen.getByRole("button", { name: "Adicionar ao carrinho" }));

    expect((await screen.findByRole("alert")).textContent).toContain("O máximo é 99");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("mostra erro genérico se a rede falhar", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<AddToCartButton productId="p1" loggedIn />);

    fireEvent.click(screen.getByRole("button", { name: "Adicionar ao carrinho" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível");
  });
});

describe("CartItemRow", () => {
  it("mostra nome, quantidade, preço unitário e subtotal", () => {
    render(<CartItemRow item={item} />);

    expect(screen.getByRole("link", { name: "Camiseta" }).getAttribute("href")).toBe("/produto/p1");
    expect((screen.getByLabelText("Quantidade de Camiseta") as HTMLInputElement).value).toBe("3");
    expect(screen.getByText(/3 × R\$\s*19,90/)).toBeTruthy();
    expect(screen.getByText(/R\$\s*59,70/)).toBeTruthy();
    expect(document.querySelector("img")?.getAttribute("src")).toBe("https://blob/a.png");
  });

  it("sem foto mostra o aviso", () => {
    render(<CartItemRow item={{ ...item, imageUrl: undefined }} />);

    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("Sem imagem")).toBeTruthy();
  });

  it("Atualizar manda a nova quantidade e recarrega a página", async () => {
    render(<CartItemRow item={item} />);

    fireEvent.change(screen.getByLabelText("Quantidade de Camiseta"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/carrinho/i1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ quantity: "5" }) }),
    );
  });

  it("Excluir remove o item", async () => {
    render(<CartItemRow item={item} />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir Camiseta" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/carrinho/i1", expect.objectContaining({ method: "DELETE" }));
  });

  it("mostra o erro do servidor ao atualizar", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Quantidade inválida" }) });
    render(<CartItemRow item={item} />);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Quantidade inválida");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("mostra erro genérico se a rede falhar", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<CartItemRow item={item} />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir Camiseta" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível");
  });
});

describe("ClearCartButton", () => {
  it("pede confirmação e esvazia o carrinho", async () => {
    render(<ClearCartButton />);

    fireEvent.click(screen.getByRole("button", { name: "Esvaziar carrinho" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/carrinho", expect.objectContaining({ method: "DELETE" }));
  });

  it("se o usuário não confirmar, não faz nada", () => {
    vi.stubGlobal("confirm", vi.fn(() => false));
    render(<ClearCartButton />);

    fireEvent.click(screen.getByRole("button", { name: "Esvaziar carrinho" }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
