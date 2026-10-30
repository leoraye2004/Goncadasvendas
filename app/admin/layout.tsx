import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { requireAdmin } from "@/lib/session";

// RN05: o middleware já barra quem não é ADMIN; aqui conferimos de novo, direto na sessão.
export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireAdmin();

  return (
    <div className="bs-container grid gap-4 py-6 lg:grid-cols-[220px_1fr]">
      <AdminSidebar />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
