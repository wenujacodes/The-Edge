import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getSafeRedirectPath(nextParam: string | null) {
  if (!nextParam || nextParam === "/") {
    return "/browse";
  }

  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/browse";
  }

  return nextParam;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const supabase = await getSupabaseServerClient();

  if (code && supabase) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (e) {
      console.error("Callback session exchange error:", e);
    }
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  // Ensure the user is marked as onboarded after a successful login/callback
  response.cookies.set("edge-onboarded", "true", { path: "/", maxAge: 31536000 });
  return response;
}
