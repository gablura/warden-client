"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Clerk authentication will not work.");
  }

  return (
    <BaseClerkProvider
      publishableKey={publishableKey || ""}
      // App-wide post-sign-in landing (enforced where a flow doesn't name its
      // own target). The console lives under /dashboard, so signed-in users
      // should end up there — not on the marketing home page.
      signInFallbackRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "w-full bg-transparent shadow-none border-none p-0",
        },
      }}
    >
      <ThemeProvider defaultTheme="light" storageKey="warden-theme">
        {children}
      </ThemeProvider>
    </BaseClerkProvider>
  );
}
