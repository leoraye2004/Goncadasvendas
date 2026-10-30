import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }));
vi.mock("next-auth/react", () => ({ signOut }));

import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import SiteHeader from "@/components/SiteHeader";

beforeEach(() => vi.clearAllMocks());

describe("SiteHeader", () => {
  it("visitante vê Entrar e Cadastrar", () => {
    render(<SiteHeader user={null} />);

    expect(screen.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("link", { name: "Cadastrar" }).getAttribute("href")).toBe("/cadastro");
    expect(screen.queryByRole("button", { name: "Sair" })).toBeNull();
  });

  it("logado vê o nome e o botão Sair, sem Entrar", () => {
    render(<SiteHeader user={{ name: "Ana", isAdmin: false }} />);

    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sair" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Entrar" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Administração" })).toBeNull();
  });

  it("admin também vê o link da Administração", () => {
    render(<SiteHeader user={{ name: "Ana", isAdmin: true }} />);

    expect(screen.getByRole("link", { name: "Administração" }).getAttribute("href")).toBe("/admin");
  });

  it("logado vê o link do carrinho com a quantidade de itens", () => {
    render(<SiteHeader user={{ name: "Ana", isAdmin: false }} cartCount={3} />);

    const carrinho = screen.getByRole("link", { name: "Carrinho, 3 itens" });
    expect(carrinho.getAttribute("href")).toBe("/carrinho");
    expect(carrinho.textContent).toContain("3");
  });

  it("com 1 item o rótulo fica no singular e sem itens mostra 0", () => {
    const { rerender } = render(<SiteHeader user={{ name: "Ana", isAdmin: false }} cartCount={1} />);
    expect(screen.getByRole("link", { name: "Carrinho, 1 item" })).toBeTruthy();

    rerender(<SiteHeader user={{ name: "Ana", isAdmin: false }} />);
    expect(screen.getByRole("link", { name: "Carrinho, 0 itens" })).toBeTruthy();
  });

  it("visitante não vê o carrinho (RN01)", () => {
    render(<SiteHeader user={null} />);

    expect(screen.queryByRole("link", { name: /Carrinho/ })).toBeNull();
  });

  it("a marca leva para a home", () => {
    render(<SiteHeader user={null} />);

    expect(screen.getByRole("link", { name: /GoncadasVendas/ }).getAttribute("href")).toBe("/");
  });
});

describe("LogoutButton", () => {
  it("sai e volta para a home", () => {
    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});

describe("Footer", () => {
  it("mostra o nome, o link do catálogo e o ano", () => {
    render(<Footer />);

    expect(screen.getAllByText(/GoncadasVendas/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Catálogo" }).getAttribute("href")).toBe("/");
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeTruthy();
  });
});
