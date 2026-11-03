import type { Metadata } from "next";
import { redirect } from "next/navigation";
import UserActions from "@/components/UserActions";
import { requireAdmin } from "@/lib/session";
import { userService } from "@/lib/users";

export const metadata: Metadata = { title: "Usuários" };
export const dynamic = "force-dynamic";

// UC09 — lista de usuários ativos (RN05: requireAdmin). Excluídos (RN04) não aparecem, mas os pedidos deles ficam.
export default async function UsuariosPage() {
  const admin = await requireAdmin();
  const result = await userService.list(admin);
  if (!result.ok) redirect("/");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Usuários</h1>

      <div className="panel overflow-x-auto">
        <table className="bs-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Pedidos</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((usuario) => (
              <tr key={usuario.id}>
                <td className="font-medium">{usuario.name}</td>
                <td>{usuario.email}</td>
                <td>{usuario.orders}</td>
                <td className="text-right">
                  <UserActions id={usuario.id} name={usuario.name} role={usuario.role} self={usuario.id === admin.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
