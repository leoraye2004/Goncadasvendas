import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import UserActions from "@/components/UserActions";

const fetchMock = vi.fn();
const confirmMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("confirm", confirmMock);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
});

describe("UserActions", () => {
  it("troca o papel chamando PATCH e atualiza a lista", async () => {
    render(<UserActions id="u2" name="Ana" role="CUSTOMER" self={false} />);

    fireEvent.change(screen.getByLabelText("Papel de Ana"), { target: { value: "ADMIN" } });

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/usuarios/u2",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ role: "ADMIN" }) }),
    );
  });

  it("mostra o erro do servidor e volta ao papel anterior", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Usuário não encontrado" }) });
    render(<UserActions id="u2" name="Ana" role="CUSTOMER" self={false} />);

    fireEvent.change(screen.getByLabelText("Papel de Ana"), { target: { value: "ADMIN" } });

    expect((await screen.findByRole("alert")).textContent).toContain("Usuário não encontrado");
    expect((screen.getByLabelText("Papel de Ana") as HTMLSelectElement).value).toBe("CUSTOMER");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("não apaga quando o admin desiste na confirmação", () => {
    confirmMock.mockReturnValue(false);
    render(<UserActions id="u2" name="Ana" role="CUSTOMER" self={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("apaga com DELETE quando confirma e atualiza a lista", async () => {
    confirmMock.mockReturnValue(true);
    render(<UserActions id="u2" name="Ana" role="CUSTOMER" self={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/usuarios/u2", expect.objectContaining({ method: "DELETE" }));
  });

  it("na própria linha do admin não há como mudar o papel nem excluir", () => {
    render(<UserActions id="a1" name="Admin" role="ADMIN" self />);

    expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull();
    expect(screen.queryByLabelText("Papel de Admin")).toBeNull();
    expect(screen.getByText("Você")).toBeTruthy();
  });
});
