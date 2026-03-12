import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Role-based dashboard paths
const ROLE_DASHBOARDS: Record<string, string> = {
  TEACHER: "/dashboard/teacher",
  CLASS_LEADER: "/dashboard/leader",
  STUDENT: "/dashboard",
};

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);
  const session = await auth();

  // Public routes — allow through
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth")
  ) {
    // If logged in and trying to access /login, redirect to their dashboard
    if (pathname === "/login" && session?.user?.role) {
      const dashboardPath = ROLE_DASHBOARDS[session.user.role] || "/dashboard";
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes — require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = session.user.role;

    // TEACHER routes — only TEACHER allowed
    if (pathname.startsWith("/dashboard/teacher") && role !== "TEACHER") {
      const redirectPath = ROLE_DASHBOARDS[role] || "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // CLASS_LEADER routes — only CLASS_LEADER allowed
    if (pathname.startsWith("/dashboard/leader") && role !== "CLASS_LEADER") {
      const redirectPath = ROLE_DASHBOARDS[role] || "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
