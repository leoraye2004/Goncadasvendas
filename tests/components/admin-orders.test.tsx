import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import OrderStatusForm from "@/components/OrderStatusForm";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
});

describe("OrderStatusForm", () => {
  it("oferece só os próximos status permitidos", () => {
    render(<OrderStatusForm id="o1" status="PENDING" />);

    const opcoes = screen.getAllByRole("option").map((o) => o.textContent);
    expect(opcoes).toEqual(["Confirmado", "Cancelado"]);
  });

  it("envia o novo status com PATCH e atualiza a página", async () => {
    render(<OrderStatusForm id="o1" status="PENDING" />);

    fireEvent.change(screen.getByLabelText("Novo status"), { target: { value: "CANCELLED" } });
    fireEvent.click(screen.getByRole("button", { name: "Atualizar status" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/pedidos/o1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) }),
    );
  });

  it("mostra o erro do servidor e não atualiza", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "O pedido mudou" }) });
    render(<OrderStatusForm id="o1" status="PENDING" />);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar status" }));

    expect((await screen.findByRole("alert")).textContent).toContain("O pedido mudou");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("pedido entregue ou cancelado não tem mais etapas", () => {
    const { unmount } = render(<OrderStatusForm id="o1" status="DELIVERED" />);
    expect(screen.getByText("Este pedido não tem próximas etapas.")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    unmount();

    render(<OrderStatusForm id="o1" status="CANCELLED" />);
    expect(screen.getByText("Este pedido não tem próximas etapas.")).toBeTruthy();
  });
});
