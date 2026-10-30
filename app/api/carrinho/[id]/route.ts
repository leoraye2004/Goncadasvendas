import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { cartService } from "@/lib/cart";
import { currentActor } from "@/lib/session";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Readonly<Contexto>) {
  const corpo = (await request.json().catch(() => null)) ?? {};
  const { id } = await params;

  const result = await cartService.setQuantity(await currentActor(), id, corpo.quantity);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}

export async function DELETE(_request: Request, { params }: Readonly<Contexto>) {
  const { id } = await params;

  const result = await cartService.remove(await currentActor(), id);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}
