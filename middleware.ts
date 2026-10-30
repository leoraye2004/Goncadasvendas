import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // RN01 (só logado): carrinho, favoritos, endereços, pedidos e conta. RN05: /admin (a checagem do papel está acima).
  matcher: [
    "/admin/:path*",
    "/carrinho/:path*",
    "/favoritos/:path*",
    "/enderecos/:path*",
    "/pedidos/:path*",
    "/conta/:path*",
  ],
};
