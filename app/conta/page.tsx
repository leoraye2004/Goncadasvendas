import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PasswordForm from "@/components/PasswordForm";
import ProfileForm from "@/components/ProfileForm";
import { profileService } from "@/lib/profile";
import { currentActor } from "@/lib/session";

export const metadata: Metadata = { title: "Minha conta" };
export const dynamic = "force-dynamic";

// RF10 — perfil e troca de senha do usuário logado (RN01). O middleware já pede login em /conta.
export default async function ContaPage() {
  const resultado = await profileService.get(await currentActor());
  if (!resultado.ok) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-[760px] space-y-6 px-4 py-10">
      <h1 className="text-[2rem] font-bold leading-tight">Minha conta</h1>
      <ProfileForm profile={resultado.data} />
      <PasswordForm />
    </main>
  );
}
