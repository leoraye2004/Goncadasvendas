import { NextResponse } from "next/server";
import { adminOrderService } from "@/lib/admin-orders";
import { failureResponse, NOT_LOGGED_IN } from "@/lib/api-result";
import { currentActor } from "@/lib/session";

type Contexto = { params: Promise<{ id: string }> };

// UC10 — muda o status do pedido. Quem confere ADMIN (RN05) e se a transição é válida é o admin-order-service.
export async function PATCH(request: Request, { params }: Readonly<Contexto>) {
  const actor = await currentActor();
  if (!actor) return NOT_LOGGED_IN();

  const corpo = (await request.json().catch(() => null)) ?? {};
  const { id } = await params;
  const result = await adminOrderService.setStatus(actor, id, corpo.status);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}
