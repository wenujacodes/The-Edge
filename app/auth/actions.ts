"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

export async function devAuthBypass(email: string) {
  // This is a safety check. In production, this should be disabled unless explicitly allowed.
  const isDev = process.env.NODE_ENV === "development";
  const allowBypass = process.env.ALLOW_AUTH_BYPASS === "true";

  if (!isDev && !allowBypass) {
    return { error: "Bypass only allowed in development or when explicitly enabled." };
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) return { error: "Admin client not available" };

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
  const redirectTo = `${protocol}://${host}/auth/callback`;

  console.log("Generating bypass link for:", email, "redirecting to:", redirectTo);

  // Try generating a magic link (for existing users)
  let result = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo }
  });

  // If user doesn't exist, try signup
  if (result.error && (result.error.message.includes("User not found") || result.error.status === 422)) {
    console.log("User not found, trying signup bypass for:", email);
    // Note: 'signup' type requires a password
    result = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      password: Math.random().toString(36).slice(-12),
      options: { redirectTo }
    });
  }

  if (result.error) {
    console.error("Admin bypass final error:", result.error);
    return { error: result.error.message };
  }
  
  return { actionLink: result.data.properties.action_link };
}
