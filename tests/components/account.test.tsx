import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import PasswordForm from "@/components/PasswordForm";
import ProfileForm from "@/components/ProfileForm";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
});

const perfil = { name: "Ana", email: "ana@example.com", birthDate: "1990-05-20" };

describe("ProfileForm", () => {
  it("vem preenchido com os dados atuais", () => {
    render(<ProfileForm profile={perfil} />);

    expect((screen.getByLabelText("Nome completo") as HTMLInputElement).value).toBe("Ana");
    expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe("ana@example.com");
    expect((screen.getByLabelText("Data de nascimento") as HTMLInputElement).value).toBe("1990-05-20");
  });

  it("envia os dados com PUT, confirma e atualiza a página (nome novo no cabeçalho)", async () => {
    render(<ProfileForm profile={perfil} />);

    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Ana Souza" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar dados" }));

    expect((await screen.findByRole("status")).textContent).toContain("Dados atualizados");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/conta/perfil",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "Ana Souza", email: "ana@example.com", birthDate: "1990-05-20" }),
      }),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("mostra o erro do servidor e não confirma", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "E-mail já cadastrado" }) });
    render(<ProfileForm profile={perfil} />);

    fireEvent.click(screen.getByRole("button", { name: "Salvar dados" }));

    expect((await screen.findByRole("alert")).textContent).toContain("E-mail já cadastrado");
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("PasswordForm", () => {
  const preencher = (atual: string, nova: string, confirmacao = nova) => {
    fireEvent.change(screen.getByLabelText("Senha atual"), { target: { value: atual } });
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: nova } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: confirmacao } });
    fireEvent.click(screen.getByRole("button", { name: "Trocar senha" }));
  };

  it("envia senha atual e nova com PUT, confirma e limpa os campos", async () => {
    render(<PasswordForm />);

    preencher("antiga123", "nova12345");

    expect((await screen.findByRole("status")).textContent).toContain("Senha alterada");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/conta/senha",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ currentPassword: "antiga123", newPassword: "nova12345" }) }),
    );
    await waitFor(() => expect((screen.getByLabelText("Senha atual") as HTMLInputElement).value).toBe(""));
  });

  it("se a confirmação não bate, nem chama o servidor", () => {
    render(<PasswordForm />);

    preencher("antiga123", "nova12345", "outra12345");

    expect(screen.getByRole("alert").textContent).toContain("não conferem");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mostra o erro do servidor (senha atual errada) e mantém os campos", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Senha atual incorreta" }) });
    render(<PasswordForm />);

    preencher("errada123", "nova12345");

    expect((await screen.findByRole("alert")).textContent).toContain("Senha atual incorreta");
    expect((screen.getByLabelText("Nova senha") as HTMLInputElement).value).toBe("nova12345");
  });
});
