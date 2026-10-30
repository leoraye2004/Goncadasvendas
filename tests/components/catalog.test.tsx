import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";

const produto = { id: "p1", name: "Camiseta Básica", category: "Roupas", brand: "GV Basics", price: 49.9, imageUrl: "https://blob/a.png" };

describe("ProductCard", () => {
  it("mostra nome, categoria, marca e preço em reais, e leva ao detalhe", () => {
    render(<ProductCard product={produto} />);

    expect(screen.getByText("Camiseta Básica")).toBeTruthy();
    expect(screen.getByText(/Roupas/)).toBeTruthy();
    expect(screen.getByText(/GV Basics/)).toBeTruthy();
    expect(screen.getByText(/R\$\s*49,90/)).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/produto/p1");
    expect(screen.getByRole("img").getAttribute("src")).toBe("https://blob/a.png");
  });

  it("mostra um aviso no lugar da imagem quando o produto não tem foto", () => {
    render(<ProductCard product={{ ...produto, imageUrl: undefined, brand: null }} />);

    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("Sem imagem")).toBeTruthy();
  });
});

describe("CategoryFilter", () => {
  it("lista Todos e as categorias como links com a categoria na URL", () => {
    render(<CategoryFilter categories={["Calçados", "Roupas"]} />);

    expect(screen.getByRole("link", { name: "Todos" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Calçados" }).getAttribute("href")).toBe("/?categoria=Cal%C3%A7ados");
    expect(screen.getByRole("link", { name: "Roupas" }).getAttribute("href")).toBe("/?categoria=Roupas");
  });

  it("marca a categoria escolhida como a atual", () => {
    render(<CategoryFilter categories={["Calçados", "Roupas"]} selected="Roupas" />);

    expect(screen.getByRole("link", { name: "Roupas" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "Todos" }).getAttribute("aria-current")).toBeNull();
  });

  it("sem escolha, o Todos é o atual", () => {
    render(<CategoryFilter categories={["Roupas"]} />);

    expect(screen.getByRole("link", { name: "Todos" }).getAttribute("aria-current")).toBe("true");
  });
});

describe("ProductGallery", () => {
  const urls = ["https://blob/1.png", "https://blob/2.png"];

  it("mostra a primeira foto e troca ao clicar na miniatura", () => {
    render(<ProductGallery name="Camiseta" urls={urls} />);

    expect(screen.getByAltText("Camiseta").getAttribute("src")).toBe(urls[0]);
    fireEvent.click(screen.getByRole("button", { name: "Ver foto 2" }));

    expect(screen.getByAltText("Camiseta").getAttribute("src")).toBe(urls[1]);
    expect(screen.getByRole("button", { name: "Ver foto 2" }).getAttribute("aria-current")).toBe("true");
  });

  it("com uma foto só, não mostra miniaturas", () => {
    render(<ProductGallery name="Camiseta" urls={[urls[0]]} />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("sem fotos, mostra o aviso", () => {
    render(<ProductGallery name="Camiseta" urls={[]} />);

    expect(screen.getByText("Sem imagem")).toBeTruthy();
  });
});
