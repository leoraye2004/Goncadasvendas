import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { profileService } from "@/lib/profile";
import { currentActor } from "@/lib/session";

// RF10 — troca a senha do próprio usuário. O service confere a senha atual e grava só o hash da nova.
export async function PUT(request: Request) {
  const corpo = (await request.json().catch(() => null)) ?? {};

  const result = await profileService.changePassword(await currentActor(), corpo);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}
