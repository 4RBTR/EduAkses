import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Role-based dashboard paths
const ROLE_DASHBOARDS: Record<string, string> = {
  TEACHER: "/dashboard/teacher",
  CLASS_LEADER: "/dashboard/leader",
  STUDENT: "/dashboard",
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/login", "/register"].includes(nextUrl.pathname);
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  if (isApiAuthRoute) return NextResponse.next();

  if (isPublicRoute) {
    if (isLoggedIn && nextUrl.pathname === "/login") {
      const dashboardPath = (userRole && ROLE_DASHBOARDS[userRole]) || "/dashboard";
      return NextResponse.redirect(new URL(dashboardPath, nextUrl));
    }
    return NextResponse.next();
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Role-based protection
    if (nextUrl.pathname.startsWith("/dashboard/teacher") && userRole !== "TEACHER") {
      const redirectPath = ROLE_DASHBOARDS[userRole || "STUDENT"] || "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }

    if (nextUrl.pathname.startsWith("/dashboard/leader") && userRole !== "CLASS_LEADER") {
      const redirectPath = ROLE_DASHBOARDS[userRole || "STUDENT"] || "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
