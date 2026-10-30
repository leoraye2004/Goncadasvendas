import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import DeleteProductButton from "@/components/DeleteProductButton";

const fetchMock = vi.fn();
const confirmMock = vi.fn();
const alertMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("confirm", confirmMock);
  vi.stubGlobal("alert", alertMock);
});

afterEach(() => vi.unstubAllGlobals());

const clicar = () => fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

describe("DeleteProductButton", () => {
  it("não faz nada quando o admin desiste na confirmação", () => {
    confirmMock.mockReturnValue(false);
    render(<DeleteProductButton id="p1" name="Camiseta" />);

    clicar();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("chama DELETE e atualiza a lista quando confirma", async () => {
    confirmMock.mockReturnValue(true);
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ resultado: "DELETED" }) });
    render(<DeleteProductButton id="p1" name="Camiseta" />);

    clicar();

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/produtos/p1", { method: "DELETE" });
    expect(alertMock).not.toHaveBeenCalled();
  });

  it("avisa quando o produto foi só desativado por já ter pedidos", async () => {
    confirmMock.mockReturnValue(true);
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ resultado: "DEACTIVATED" }) });
    render(<DeleteProductButton id="p1" name="Camiseta" />);

    clicar();

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("desativado")));
    expect(refresh).toHaveBeenCalled();
  });

  it("mostra o erro do servidor e não atualiza a lista", async () => {
    confirmMock.mockReturnValue(true);
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Produto não encontrado" }) });
    render(<DeleteProductButton id="p1" name="Camiseta" />);

    clicar();

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith("Produto não encontrado"));
    expect(refresh).not.toHaveBeenCalled();
  });
});
