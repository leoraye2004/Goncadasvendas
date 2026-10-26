import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { createUserRepository } from "@/repositories/user-repository";
import { createAuthService } from "@/services/auth-service";

// Único lugar onde o service é ligado ao repositório. O NextAuth e as páginas usam esta instância.
export const authService = createAuthService(createUserRepository(prisma));

// Chamado pelo NextAuth no login. Toda a regra (senha, usuário apagado, tempo igual) fica no service.
export async function authorizeCredentials(
  credentials: Record<"email" | "password", string> | undefined
) {
  if (!credentials?.email || !credentials?.password) return null;
  return authService.authenticate(credentials.email, credentials.password);
}

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
