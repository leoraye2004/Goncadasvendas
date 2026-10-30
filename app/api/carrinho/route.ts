import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { cartService } from "@/lib/cart";
import { currentActor } from "@/lib/session";

// UC05 — adicionar ao carrinho. Quem confere o login (RN01) e a quantidade é o cart-service.
export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) ?? {};
  const productId = typeof corpo.productId === "string" ? corpo.productId : "";

  const result = await cartService.add(await currentActor(), productId, corpo.quantity);

  return result.ok ? NextResponse.json({ ok: true }, { status: 201 }) : failureResponse(result);
}

// Esvazia o carrinho do usuário logado.
export async function DELETE() {
  const result = await cartService.clear(await currentActor());

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}
