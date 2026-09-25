import { NextResponse, type NextRequest } from "next/server";

// Debe coincidir con SESSION_COOKIE en backend/auth/session.ts.
const SESSION_COOKIE = "coinstellation_session";

/**
 * Chequeo optimista: si no hay cookie de sesión, manda al login sin llegar a renderizar.
 * La validación real (contra la base de datos) la hace el layout del dashboard.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.nextUrl);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/proyectos/:path*"],
};
