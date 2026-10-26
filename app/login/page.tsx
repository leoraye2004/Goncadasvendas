import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ cadastro?: string }>;
}>) {
  const { cadastro } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <LoginForm justRegistered={cadastro === "ok"} />
    </main>
  );
}
