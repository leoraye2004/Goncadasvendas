import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GoncadasVendas", template: "%s | GoncadasVendas" },
  description: "Plataforma web de gestão de vendas para pequenos comércios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
