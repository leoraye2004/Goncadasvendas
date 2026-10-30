import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { addressService } from "@/lib/addresses";
import { currentActor } from "@/lib/session";

type Contexto = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Readonly<Contexto>) {
  const corpo = await request.json().catch(() => null);
  const { id } = await params;

  const result = await addressService.update(await currentActor(), id, corpo);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}

export async function DELETE(_request: Request, { params }: Readonly<Contexto>) {
  const { id } = await params;

  const result = await addressService.remove(await currentActor(), id);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}
