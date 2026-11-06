import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "@/components/ToastProvider";

function Botoes() {
  const toast = useToast();
  return (
    <>
      <button onClick={() => toast.success("Salvo com sucesso")}>ok</button>
      <button onClick={() => toast.error("Deu ruim")}>erro</button>
    </>
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("ToastProvider", () => {
  it("mostra o aviso de sucesso e o some sozinho depois de alguns segundos", () => {
    render(
      <ToastProvider>
        <Botoes />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("ok"));
    expect(screen.getByRole("status").textContent).toContain("Salvo com sucesso");

    act(() => void vi.advanceTimersByTime(4100));
    expect(screen.queryByText("Salvo com sucesso")).toBeNull();
  });

  it("aviso de erro usa role=alert (leitor de tela lê na hora) e fica mais tempo na tela", () => {
    render(
      <ToastProvider>
        <Botoes />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("erro"));
    expect(screen.getByRole("alert").textContent).toContain("Deu ruim");

    act(() => void vi.advanceTimersByTime(4100));
    expect(screen.getByText("Deu ruim")).toBeTruthy();
    act(() => void vi.advanceTimersByTime(3000));
    expect(screen.queryByText("Deu ruim")).toBeNull();
  });

  it("o botão fechar remove o aviso e vários avisos aparecem juntos", () => {
    render(
      <ToastProvider>
        <Botoes />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("ok"));
    fireEvent.click(screen.getByText("erro"));
    expect(screen.getAllByRole("button", { name: "Fechar aviso" })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Fechar aviso" })[0]);
    expect(screen.queryByText("Salvo com sucesso")).toBeNull();
    expect(screen.getByText("Deu ruim")).toBeTruthy();
  });

  it("fora do provider, useToast não quebra (os componentes continuam funcionando em testes e páginas isoladas)", () => {
    render(<Botoes />);

    expect(() => fireEvent.click(screen.getByText("ok"))).not.toThrow();
  });
});
