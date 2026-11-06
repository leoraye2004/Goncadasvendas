import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh, push, toast, signIn } = vi.hoisted(() => ({
  refresh: vi.fn(),
  push: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
  signIn: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push }) }));
vi.mock("next-auth/react", () => ({ signIn }));
vi.mock("@/components/ToastProvider", () => ({ useToast: () => toast }));

import AddressForm from "@/components/AddressForm";
import CadastroForm from "@/components/CadastroForm";
import DeleteProductButton from "@/components/DeleteProductButton";
import LoginForm from "@/components/LoginForm";
import PasswordForm from "@/components/PasswordForm";
import ProductForm from "@/components/ProductForm";
import ProfileForm from "@/components/ProfileForm";

const fetchMock = vi.fn();
const deuCerto = (corpo = {}) => fetchMock.mockResolvedValue({ ok: true, json: async () => corpo });
const deuErrado = () => fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Falhou no servidor" }) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("confirm", vi.fn(() => true));
  vi.stubGlobal("alert", vi.fn());
  deuCerto();
});

const preencher = (rotulo: string, valor: string) => fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });

describe("conta", () => {
  it("perfil: avisa quando salva e quando falha", async () => {
    render(<ProfileForm profile={{ name: "Ana", email: "ana@x.com", birthDate: "1990-05-20" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar dados" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Dados atualizados"));

    deuErrado();
    fireEvent.click(screen.getByRole("button", { name: "Salvar dados" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
  });

  it("senha: avisa quando troca, quando não conferem e quando o servidor recusa", async () => {
    render(<PasswordForm />);
    preencher("Senha atual", "antiga123");
    preencher("Nova senha", "novaSenha99");
    preencher("Confirmar nova senha", "outraCoisa");
    fireEvent.click(screen.getByRole("button", { name: "Trocar senha" }));
    expect(toast.error).toHaveBeenCalledWith("As senhas não conferem");

    preencher("Confirmar nova senha", "novaSenha99");
    fireEvent.click(screen.getByRole("button", { name: "Trocar senha" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Senha alterada"));

    deuErrado();
    preencher("Senha atual", "antiga123");
    preencher("Nova senha", "novaSenha99");
    preencher("Confirmar nova senha", "novaSenha99");
    fireEvent.click(screen.getByRole("button", { name: "Trocar senha" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
  });

  it("endereço: avisa quando salva e quando falha", async () => {
    render(<AddressForm />);
    for (const [rotulo, valor] of [["CEP", "89201001"], ["Rua", "Rua A"], ["Número", "10"], ["Bairro", "Centro"], ["Cidade", "Joinville"], ["UF", "SC"]]) {
      preencher(rotulo, valor);
    }
    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Endereço salvo"));

    deuErrado();
    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
  });
});

describe("login e cadastro", () => {
  it("login: boas-vindas ao entrar e aviso de erro quando recusa", async () => {
    signIn.mockResolvedValueOnce({ ok: true });
    render(<LoginForm />);
    preencher("E-mail", "ana@x.com");
    preencher("Senha", "senha1234");
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Bem-vindo de volta!"));

    signIn.mockResolvedValueOnce({ error: "CredentialsSignin" });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("E-mail ou senha inválidos"));
  });

  it("cadastro: avisa que deu certo e, se falhar, mostra o erro", async () => {
    render(<CadastroForm />);
    for (const [rotulo, valor] of [["Nome completo", "Ana"], ["E-mail", "ana@x.com"], ["CPF", "52998224725"], ["Data de nascimento", "1990-05-20"], ["Senha", "senha1234"]]) {
      preencher(rotulo, valor);
    }
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Cadastro concluído! Entre com seu e-mail e senha."));
    expect(push).toHaveBeenCalledWith("/login?cadastro=ok");

    deuErrado();
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
  });
});

describe("administração de produtos", () => {
  it("cadastrar produto avisa; erro vira aviso", async () => {
    render(<ProductForm />);
    preencher("Nome", "Boné");
    preencher("Categoria", "Acessórios");
    preencher("Preço (R$)", "39,90");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Produto salvo"));

    deuErrado();
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
  });

  it("excluir produto avisa; produto já pedido é desativado e o aviso explica; erro usa o aviso, não o alert", async () => {
    render(<DeleteProductButton id="p1" name="Boné" />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Produto excluído"));

    deuCerto({ resultado: "DEACTIVATED" });
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Este produto já tem pedidos, então foi desativado em vez de excluído."),
    );

    deuErrado();
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou no servidor"));
    expect(window.alert).not.toHaveBeenCalled();
  });
});
