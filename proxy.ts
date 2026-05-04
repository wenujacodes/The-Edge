import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Simulated rate limiting for testing phase
// In production, use @upstash/ratelimit with Redis
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 1000; // Increased for testing phase as requested
const ipRequests = new Map<string, { count: number, lastReset: number }>();
const PUBLIC_FILE = /\.[^/]+$/;

export default async function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  const userData = ipRequests.get(ip) || { count: 0, lastReset: now };

  // Reset window if needed
  if (now - userData.lastReset > RATE_LIMIT_WINDOW) {
    userData.count = 0;
    userData.lastReset = now;
  }

  userData.count++;
  ipRequests.set(ip, userData);

  if (userData.count > MAX_REQUESTS) {
    return new NextResponse("Rate limit exceeded. Please try again later.", { status: 429 });
  }

  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let user = null;

  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    });

    ({ data: { user } } = await supabase.auth.getUser());
  }

  const isAuthPage = pathname.startsWith("/auth") || pathname === "/login";
  const isPublicRoute =
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/vendor");
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    PUBLIC_FILE.test(pathname);

  if (!user && !isAuthPage && !isPublicRoute && !isPublicAsset) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (user && isAuthPage) {
    const redirectResponse = NextResponse.redirect(new URL("/browse", request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "location") {
        redirectResponse.headers.set(key, value);
      }
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
