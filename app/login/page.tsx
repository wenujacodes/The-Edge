"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Sparkles className="w-8 h-8 animate-pulse text-primary" /></div>}>
      <AuthLayout initialMode="login" />
    </Suspense>
  );
}
