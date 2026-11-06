import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh, push, toast } = vi.hoisted(() => ({
  refresh: vi.fn(),
  push: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push }) }));
vi.mock("@/components/ToastProvider", () => ({ useToast: () => toast }));

import AddToCartButton from "@/components/AddToCartButton";
import CartItemRow from "@/components/CartItemRow";
import CheckoutForm from "@/components/CheckoutForm";
import ClearCartButton from "@/components/ClearCartButton";
import DeleteAddressButton from "@/components/DeleteAddressButton";
import FavoriteButton from "@/components/FavoriteButton";
import OrderStatusForm from "@/components/OrderStatusForm";
import UserActions from "@/components/UserActions";

const fetchMock = vi.fn();
const deuCerto = () => fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: "o1" }) });
const deuErrado = () => fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Falhou no servidor" }) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("confirm", vi.fn(() => true));
  vi.stubGlobal("alert", vi.fn());
  deuCerto();
});

const item = { id: "i1", productId: "p1", name: "Camiseta", unitPrice: 19.9, quantity: 3, lineTotal: 59.7 };

describe("carrinho", () => {
  it("adicionar: aviso de sucesso e, se falhar, aviso de erro", async () => {
    render(<AddToCartButton productId="p1" loggedIn />);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar ao carrinho" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Produto adicionado ao carrinho"));

    deuErrado();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar ao carrinho" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
  });

  it("atualizar quantidade e excluir item avisam o resultado", async () => {
    render(<CartItemRow item={item} />);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Quantidade atualizada"));

    fireEvent.click(screen.getByRole("button", { name: "Excluir Camiseta" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Item removido do carrinho"));
  });

  it("erro ao mexer no item vira aviso de erro", async () => {
    deuErrado();
    render(<CartItemRow item={item} />);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
  });

  it("esvaziar o carrinho avisa o sucesso; no erro usa o aviso, não o alert do navegador", async () => {
    render(<ClearCartButton />);
    fireEvent.click(screen.getByRole("button", { name: "Esvaziar carrinho" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Carrinho esvaziado"));

    deuErrado();
    fireEvent.click(screen.getByRole("button", { name: "Esvaziar carrinho" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
    expect(window.alert).not.toHaveBeenCalled();
  });
});

describe("checkout", () => {
  const enderecos = [{ id: "a1", label: "Rua A, 10" }];

  it("pedido confirmado: aviso de sucesso e vai para a tela do pedido", async () => {
    render(<CheckoutForm addresses={enderecos} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Pedido confirmado!"));
    expect(push).toHaveBeenCalledWith("/pedidos/o1?confirmado=1");
  });

  it("falha ao confirmar vira aviso de erro e não sai da tela", async () => {
    deuErrado();
    render(<CheckoutForm addresses={enderecos} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
    expect(push).not.toHaveBeenCalled();
  });
});

describe("favoritos, endereços e administração", () => {
  it("favoritar e desfavoritar avisam", async () => {
    render(<FavoriteButton productId="p1" loggedIn favorite={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Favoritar/ }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Adicionado aos favoritos"));

    fireEvent.click(screen.getByRole("button", { name: /Remover dos favoritos/ }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Removido dos favoritos"));
  });

  it("excluir endereço avisa; no erro usa o aviso, não o alert", async () => {
    render(<DeleteAddressButton id="a1" />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Endereço excluído"));

    deuErrado();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
    expect(window.alert).not.toHaveBeenCalled();
  });

  it("admin: atualizar status do pedido avisa", async () => {
    render(<OrderStatusForm id="o1" status="PENDING" />);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar status" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Status do pedido atualizado"));
  });

  it("admin: trocar o papel e excluir usuário avisam", async () => {
    render(<UserActions id="u1" name="Ana" role="CUSTOMER" self={false} />);

    fireEvent.change(screen.getByLabelText("Papel de Ana"), { target: { value: "ADMIN" } });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Papel atualizado"));

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Usuário excluído"));
  });

  it("admin: erro ao mexer no usuário vira aviso de erro", async () => {
    deuErrado();
    render(<UserActions id="u1" name="Ana" role="CUSTOMER" self={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
  });
});
