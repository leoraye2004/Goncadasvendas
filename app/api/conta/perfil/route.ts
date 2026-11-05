import { NextResponse } from "next/server";
import { failureResponse } from "@/lib/api-result";
import { profileService } from "@/lib/profile";
import { currentActor } from "@/lib/session";

// RF10 — atualiza nome, e-mail e nascimento do próprio usuário. O service confere login, dados e e-mail único.
export async function PUT(request: Request) {
  const corpo = (await request.json().catch(() => null)) ?? {};

  const result = await profileService.update(await currentActor(), corpo);

  return result.ok ? NextResponse.json({ ok: true }) : failureResponse(result);
}
