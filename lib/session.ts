import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Actor } from "@/services/product-service";

// Quem está logado (ou null). O id e o papel vêm do token, nunca de algo que o navegador manda.
export async function currentActor(): Promise<Actor | null> {
  const session = await getServerSession(authOptions);
  return session?.user ? { id: session.user.id, role: session.user.role } : null;
}

export type HeaderUser = { name: string; isAdmin: boolean };

// Só o que o cabeçalho precisa mostrar: o nome e se há o link do admin.
export async function currentUser(): Promise<HeaderUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user ? { name: session.user.name ?? "", isAdmin: session.user.role === "ADMIN" } : null;
}

// Para páginas do admin: sem login vai para /login; logado sem ser ADMIN vai para a home (RN05).
export async function requireAdmin(): Promise<Actor> {
  const actor = await currentActor();
  if (!actor) redirect("/login");
  if (actor.role !== "ADMIN") redirect("/");
  return actor;
}
