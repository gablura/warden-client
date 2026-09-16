"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";

export function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28 lg:py-36 px-4">
      <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-foreground-secondary">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
        Live on Arc
      </div>

      <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        Governance for AI agents
        <br className="hidden sm:block" />{" "}
        that move money
      </h1>

      <p className="max-w-lg text-base leading-relaxed text-foreground-secondary sm:text-lg">
        Enforce spend limits, require human approvals, and maintain a complete
        audit trail — without holding a single dollar of agent funds.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        {isAuthenticated ? (
          <Link href="/dashboard" className="btn btn-primary px-6 py-2.5">
            Open Dashboard
          </Link>
        ) : (
          <Link href="/sign-in" className="btn btn-primary px-6 py-2.5">
            Get Started
          </Link>
        )}
        <a href="#how-it-works" className="btn btn-ghost px-6 py-2.5">
          How it works
        </a>
      </div>
    </section>
  );
}
