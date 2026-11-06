import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";

describe("página de erro", () => {
  it("explica o problema sem mostrar detalhes técnicos e deixa tentar de novo", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("detalhe interno do banco")} reset={reset} />);

    expect(screen.getByRole("heading", { name: "Algo deu errado" })).toBeTruthy();
    expect(screen.queryByText(/detalhe interno/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
