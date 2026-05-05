import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
  const mode = requestUrl.searchParams.get("mode") || "signup";
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const supabase = await getSupabaseServerClient();

  if (code && supabase) {
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;

      const user = data.user;
      if (user && mode === "login") {
        // Check if user is brand new (created in the last 15 seconds)
        const createdAt = new Date(user.created_at).getTime();
        const now = new Date().getTime();
        const isNewUser = (now - createdAt) < 15000; // 15 seconds threshold

        if (isNewUser) {
          console.log("New user detected during login-only flow. Signing out and notifying user.");
          
          // Sign out the current session
          await supabase.auth.signOut();

          // Optional: Use admin client to delete the user so they aren't "existing" next time
          const adminClient = getSupabaseAdminClient();
          if (adminClient) {
            await adminClient.auth.admin.deleteUser(user.id);
            console.log("Accidental user deleted successfully.");
          }

          // Redirect back to auth with an error message
          return NextResponse.redirect(new URL(`/auth?error=user-not-found&mode=login`, requestUrl.origin));
        }
      }
    } catch (e) {
      console.error("Callback session exchange error:", e);
      return NextResponse.redirect(new URL(`/auth?error=auth-failed`, requestUrl.origin));
    }
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  // Ensure the user is marked as onboarded after a successful login/callback
  response.cookies.set("edge-onboarded", "true", { path: "/", maxAge: 31536000 });
  return response;
}
