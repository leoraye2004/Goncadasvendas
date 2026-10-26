import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import CadastroForm from "@/components/CadastroForm";

const fetchMock = vi.fn();

function preencherEEnviar() {
  fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Ana Souza" } });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@example.com" } });
  fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "529.982.247-25" } });
  fireEvent.change(screen.getByLabelText("Data de nascimento"), { target: { value: "1990-05-20" } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha1234" } });
  fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe("CadastroForm", () => {
  it("mostra todos os campos do cadastro", () => {
    render(<CadastroForm />);

    for (const campo of ["Nome completo", "E-mail", "CPF", "Data de nascimento", "Senha"]) {
      expect(screen.getByLabelText(campo)).toBeTruthy();
    }
  });

  it("envia os dados para /api/cadastro e vai para o login quando dá certo", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: "u1" }) });
    render(<CadastroForm />);

    preencherEEnviar();

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login?cadastro=ok"));
    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/cadastro");
    expect(opcoes.method).toBe("POST");
    expect(JSON.parse(opcoes.body)).toEqual({
      name: "Ana Souza",
      email: "ana@example.com",
      cpf: "529.982.247-25",
      birthDate: "1990-05-20",
      password: "senha1234",
    });
  });

  it("mostra a mensagem de erro que a API devolver (ex.: e-mail repetido)", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "E-mail já cadastrado" }) });
    render(<CadastroForm />);

    preencherEEnviar();

    expect((await screen.findByRole("alert")).textContent).toBe("E-mail já cadastrado");
    expect(push).not.toHaveBeenCalled();
  });

  it("mostra erro genérico quando a API não responde direito", async () => {
    fetchMock.mockRejectedValue(new Error("rede"));
    render(<CadastroForm />);

    preencherEEnviar();

    expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível concluir o cadastro");
  });

  it("mostra 'Cadastrando...' e desabilita o botão enquanto espera", async () => {
    let terminar: (valor: unknown) => void = () => {};
    fetchMock.mockReturnValue(new Promise((resolve) => (terminar = resolve)));
    render(<CadastroForm />);

    preencherEEnviar();

    const botao = (await screen.findByRole("button", { name: "Cadastrando..." })) as HTMLButtonElement;
    expect(botao.disabled).toBe(true);
    terminar({ ok: true, json: async () => ({}) });
    await waitFor(() => expect(push).toHaveBeenCalled());
  });
});
