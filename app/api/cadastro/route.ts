import { NextResponse } from "next/server";
import { authService } from "@/lib/auth";

const STATUS = { INVALID: 400, EMAIL_IN_USE: 409, CPF_IN_USE: 409 } as const;

// Fina de propósito: só lê o JSON, chama o service e devolve o resultado. As regras estão no service.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await authService.register(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: STATUS[result.code] });
  }
  return NextResponse.json({ id: result.user.id }, { status: 201 });
}
