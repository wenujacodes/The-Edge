"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
// TODO: Replace with real PostHog key from environment variable
// import posthog from "posthog-js";
// import { PostHogProvider } from "posthog-js/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
      >
        {/* TODO: Wrap with PostHogProvider once real key is set */}
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
