import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { cartService } from "@/lib/cart";
import { currentActor, currentUser } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GoncadasVendas", template: "%s | GoncadasVendas" },
  description: "Plataforma web de gestão de vendas para pequenos comércios.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [user, actor] = await Promise.all([currentUser(), currentActor()]);
  const cartCount = await cartService.count(actor);

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader user={user} cartCount={cartCount} />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
