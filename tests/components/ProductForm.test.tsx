import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import ProductForm from "@/components/ProductForm";

const fetchMock = vi.fn();

const produto = {
  id: "p1",
  name: "Camiseta",
  category: "Roupas",
  brand: "GV",
  price: "49,90",
  images: [{ id: "i1", url: "https://blob/a.png" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe("ProductForm — novo produto", () => {
  it("mostra os campos do cadastro", () => {
    render(<ProductForm />);

    for (const campo of ["Nome", "Categoria", "Marca", "Preço (R$)"]) {
      expect(screen.getByLabelText(campo)).toBeTruthy();
    }
    expect(screen.getByLabelText(/Imagens/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cadastrar produto" })).toBeTruthy();
  });

  it("envia o formulário por POST e volta para a lista", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: "p9" }) });
    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Boné" } });
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "Acessórios" } });
    fireEvent.change(screen.getByLabelText("Preço (R$)"), { target: { value: "39,90" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/produtos"));
    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/produtos");
    expect(opcoes.method).toBe("POST");
    expect((opcoes.body as FormData).get("name")).toBe("Boné");
    expect(refresh).toHaveBeenCalled();
  });

  it("mostra o erro devolvido pelo servidor e não sai da tela", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "O preço deve ser maior que zero" }) });
    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Boné" } });
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "Acessórios" } });
    fireEvent.change(screen.getByLabelText("Preço (R$)"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    expect((await screen.findByRole("alert")).textContent).toBe("O preço deve ser maior que zero");
    expect(push).not.toHaveBeenCalled();
  });

  it("mostra uma mensagem geral quando a rede falha", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Boné" } });
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "Acessórios" } });
    fireEvent.change(screen.getByLabelText("Preço (R$)"), { target: { value: "39,90" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível salvar");
  });
});

describe("ProductForm — editar produto", () => {
  it("vem preenchido, lista as imagens atuais e envia por PUT", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: "p1" }) });
    render(<ProductForm product={produto} />);

    expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe("Camiseta");
    expect((screen.getByLabelText("Preço (R$)") as HTMLInputElement).value).toBe("49,90");
    fireEvent.click(screen.getByLabelText("Remover"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/produtos"));
    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/produtos/p1");
    expect(opcoes.method).toBe("PUT");
    expect((opcoes.body as FormData).getAll("removeImageIds")).toEqual(["i1"]);
  });

  it("Cancelar volta para a lista sem enviar nada", () => {
    render(<ProductForm product={produto} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(push).toHaveBeenCalledWith("/admin/produtos");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
