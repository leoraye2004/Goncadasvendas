import { NextResponse } from "next/server";
import { failureResponse, NOT_LOGGED_IN } from "@/lib/api-result";
import { currentActor } from "@/lib/session";
import { userService } from "@/lib/users";

type Contexto = { params: Promise<{ id: string }> };

// UC09 — trocar o papel. Quem confere ADMIN (RN05) e o valor do papel é o user-service.
export async function PATCH(request: Request, { params }: Readonly<Contexto>) {
  const actor = await currentActor();
  if (!actor) return NOT_LOGGED_IN();

  const corpo = (await request.json().catch(() => null)) ?? {};
  const { id } = await params;
  const result = await userService.setRole(actor, id, corpo.role);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}

// UC09 — excluir usuário (soft delete, RN04).
export async function DELETE(_request: Request, { params }: Readonly<Contexto>) {
  const actor = await currentActor();
  if (!actor) return NOT_LOGGED_IN();

  const { id } = await params;
  const result = await userService.remove(actor, id);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}
