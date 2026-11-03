import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { addressService } from "@/lib/addresses";
import { currentActor } from "@/lib/session";

// UC08 — criar endereço. Login (RN01) e validação ficam no address-service.
export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null);

  const result = await addressService.create(await currentActor(), corpo);

  return result.ok ? NextResponse.json({ id: result.data.id }, { status: 201 }) : failureResponse(result);
}
