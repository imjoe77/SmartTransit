import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/api/auth", "/api/socketio", "/login"];

function isPublicPath(pathname: string) {
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return true;
  }
  return PUBLIC_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (isPublicPath(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.next();
  }

  const role = token.role;

  // Protect Admin Routes
  if (pathname.startsWith("/admin") && role !== "admin") {
    // Redirect unauthorized users to the admin login page with an error
    return NextResponse.redirect(new URL("/login?role=admin&error=AccessDenied", request.url));
  }

  // Protect Driver Routes
  if (pathname.startsWith("/driver") && role !== "driver") {
    // Redirect unauthorized users to the driver login page with an error
    return NextResponse.redirect(new URL("/login?role=driver&error=AccessDenied", request.url));
  }

  if (role === "driver" && pathname === "/tracking") {
    return NextResponse.redirect(new URL("/driver", request.url));
  }

  if (role === "admin" && pathname === "/tracking") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
