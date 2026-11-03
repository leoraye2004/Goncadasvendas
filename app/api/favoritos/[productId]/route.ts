import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { favoriteService } from "@/lib/favorites";
import { currentActor } from "@/lib/session";

type Contexto = { params: Promise<{ productId: string }> };

// UC07 — desfavoritar um produto.
export async function DELETE(_request: Request, { params }: Readonly<Contexto>) {
  const { productId } = await params;

  const result = await favoriteService.remove(await currentActor(), productId);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}
