"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-background flex items-center justify-center"><Sparkles className="w-8 h-8 animate-pulse text-primary" /></div>}>
      <AuthLayout />
    </Suspense>
  );
}
