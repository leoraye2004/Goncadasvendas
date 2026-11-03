import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import FavoriteButton from "@/components/FavoriteButton";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
});

describe("FavoriteButton", () => {
  it("visitante vê um convite para entrar, sem botão (RN01)", () => {
    render(<FavoriteButton productId="p1" loggedIn={false} favorite={false} />);

    expect(screen.getByRole("link", { name: "Entrar para favoritar" }).getAttribute("href")).toBe("/login");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("favorita enviando o produto e passa a oferecer remover", async () => {
    render(<FavoriteButton productId="p1" loggedIn favorite={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Favoritar" }));

    expect(await screen.findByRole("button", { name: "Remover dos favoritos" })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/favoritos",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ productId: "p1" }) }),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("desfavorita chamando DELETE e volta a oferecer favoritar", async () => {
    render(<FavoriteButton productId="p1" loggedIn favorite />);

    fireEvent.click(screen.getByRole("button", { name: "Remover dos favoritos" }));

    expect(await screen.findByRole("button", { name: "Favoritar" })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("/api/favoritos/p1", expect.objectContaining({ method: "DELETE" }));
  });

  it("mostra o erro do servidor e não troca o estado", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Produto não encontrado" }) });
    render(<FavoriteButton productId="p1" loggedIn favorite={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Favoritar" }));

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Produto não encontrado"));
    expect(screen.getByRole("button", { name: "Favoritar" })).toBeTruthy();
  });
});
