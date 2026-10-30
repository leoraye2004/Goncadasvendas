"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-header"
    >
      Sair
    </button>
  );
}
