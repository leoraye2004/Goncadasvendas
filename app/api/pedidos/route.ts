import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { orderService } from "@/lib/orders";
import { currentActor } from "@/lib/session";

// UC06 — finalizar pedido a partir do carrinho. Login (RN01), carrinho e endereço são conferidos no order-service.
export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) ?? {};

  const result = await orderService.checkout(await currentActor(), corpo.addressId);

  return result.ok ? NextResponse.json({ id: result.data.id }, { status: 201 }) : failureResponse(result);
}
