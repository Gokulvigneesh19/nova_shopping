import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

// Optimistic role-based routing using the cookies set at login.
// The API must still authorize every request; this only keeps each role on its own side.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoggedIn = request.cookies.has(AUTH_COOKIE.ACCESS_TOKEN);
  const role = request.cookies.get(AUTH_COOKIE.ROLE)?.value;
  const isAdmin = isLoggedIn && role === "admin";

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login";

  const redirect = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (isAdminLogin) {
    if (isAdmin) return redirect("/admin");
    if (isLoggedIn) return redirect("/");
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return redirect(`/admin/login?next=${encodeURIComponent(pathname + search)}`);
    }
    if (!isAdmin) return redirect("/");
    return NextResponse.next();
  }

  // Every other page is the user storefront, which admins can't access.
  if (isAdmin) return redirect("/admin");

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next internals, API routes and files with an extension (images, models, favicon…).
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};
