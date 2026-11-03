import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { favoriteService } from "@/lib/favorites";
import { currentActor } from "@/lib/session";

// UC07 — favoritar um produto. Quem confere o login (RN01) e se o produto está visível (RN03) é o favorite-service.
export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) ?? {};
  const productId = typeof corpo.productId === "string" ? corpo.productId : "";

  const result = await favoriteService.add(await currentActor(), productId);

  return result.ok ? NextResponse.json({ ok: true }, { status: 201 }) : failureResponse(result);
}
