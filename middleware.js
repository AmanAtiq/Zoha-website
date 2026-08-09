import { NextResponse } from "next/server";

const ADMIN_COOKIE = "za_admin_session";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin/");
  const isPage = pathname.startsWith("/admin");

  if (!isApi && !isPage) return NextResponse.next();

  // The login page and the login endpoint are open — they handle auth.
  if (pathname === "/admin" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
