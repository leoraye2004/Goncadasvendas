import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, push, refresh } = vi.hoisted(() => ({ signIn: vi.fn(), push: vi.fn(), refresh: vi.fn() }));

vi.mock("next-auth/react", () => ({ signIn }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import LoginForm from "@/components/LoginForm";

function preencherEEnviar() {
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@example.com" } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha1234" } });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

beforeEach(() => vi.clearAllMocks());

describe("LoginForm", () => {
  it("mostra os campos e o botão Entrar", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toBeTruthy();
    expect(screen.getByLabelText("Senha")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeTruthy();
  });

  it("avisa que o cadastro deu certo quando vem de /cadastro", () => {
    render(<LoginForm justRegistered />);

    expect(screen.getByRole("status").textContent).toContain("Cadastro concluído");
  });

  it("entra e vai para a página inicial quando o login dá certo", async () => {
    signIn.mockResolvedValue({ ok: true, error: undefined });
    render(<LoginForm />);

    preencherEEnviar();

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "ana@example.com",
      password: "senha1234",
      redirect: false,
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("mostra erro genérico (sem dizer se foi e-mail ou senha) e não navega", async () => {
    signIn.mockResolvedValue({ ok: false, error: "CredentialsSignin" });
    render(<LoginForm />);

    preencherEEnviar();

    expect((await screen.findByRole("alert")).textContent).toBe("E-mail ou senha inválidos");
    expect(push).not.toHaveBeenCalled();
  });

  it("mostra erro quando o login falha por problema de rede", async () => {
    signIn.mockRejectedValue(new Error("rede"));
    render(<LoginForm />);

    preencherEEnviar();

    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível entrar");
  });

  it("mostra 'Entrando...' e desabilita o botão enquanto espera", async () => {
    let terminar: (valor: unknown) => void = () => {};
    signIn.mockReturnValue(new Promise((resolve) => (terminar = resolve)));
    render(<LoginForm />);

    preencherEEnviar();

    const botao = (await screen.findByRole("button", { name: "Entrando..." })) as HTMLButtonElement;
    expect(botao.disabled).toBe(true);
    terminar({ ok: true });
    await waitFor(() => expect(push).toHaveBeenCalled());
  });
});
