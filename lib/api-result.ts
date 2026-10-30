import { NextResponse } from "next/server";

const STATUS = { FORBIDDEN: 403, INVALID: 400, INVALID_IMAGE: 400, NOT_FOUND: 404, STORAGE_ERROR: 502 } as const;

// Transforma a falha de um service em resposta HTTP. As rotas só chamam isto quando result.ok é falso.
export function failureResponse(result: { code: keyof typeof STATUS; message: string }) {
  return NextResponse.json({ error: result.message }, { status: STATUS[result.code] });
}

export const NOT_LOGGED_IN = () => NextResponse.json({ error: "Faça login para continuar" }, { status: 401 });
