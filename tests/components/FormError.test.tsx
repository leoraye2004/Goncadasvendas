import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormError from "@/components/FormError";

describe("FormError", () => {
  it("mostra a mensagem de erro com role=alert", () => {
    render(<FormError message="E-mail já cadastrado" />);

    expect(screen.getByRole("alert").textContent).toBe("E-mail já cadastrado");
  });

  it("não renderiza nada quando não há mensagem", () => {
    render(<FormError message={undefined} />);

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
