import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Why Warden exists, what it solves, and the principles behind its design.",
};

const PRINCIPLES = [
  {
    number: "01",
    title: "Non-custodial first",
    description:
      "Warden never holds agent funds. If Warden disappears tomorrow, every agent still has their money. This is not a feature — it is the only acceptable architecture for a system that governs real spending.",
  },
  {
    number: "02",
    title: "On-chain enforcement",
    description:
      "Policy limits are smart contract state. No amount of backend compromise, database injection, or server misconfiguration can bypass a daily cap that lives on-chain. Enforcement is a property of the system, not a promise.",
  },
  {
    number: "03",
    title: "Audit everything",
    description:
      "Every decision is recorded — approved, blocked, escalated, rejected. Not just the outcome, but who made the call, when, and under what policy. If it happened in Warden, there is a record of it.",
  },
  {
    number: "04",
    title: "Human in the loop",
    description:
      "Autonomous agents are powerful, but spending real money requires oversight. Warden's approval workflows ensure that high-value or high-risk transactions get human review before any funds move.",
  },
];

const STACK = [
  { label: "Smart Contracts", detail: "Solidity ^0.8.24, Foundry" },
  { label: "Blockchain", detail: "Arc (USDC native, 6 decimals)" },
  { label: "Backend", detail: "Fastify 5, Prisma 7, viem" },
  { label: "Frontend", detail: "Next.js 16, React 19, Tailwind v4" },
  { label: "Protocol", detail: "WebSocket for live events" },
  { label: "Auth", detail: "Per-person API keys, HMAC signing" },
] as const;

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-info" />
            About
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Governance for AI agents
            <br className="hidden sm:block" />{" "}
            that move money
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground-secondary sm:text-base">
            Warden is the governance and visibility layer for AI agents that
            move money. It exists because autonomous agents are already making
            real payments — and most teams have no way to control or even see
            what is happening.
          </p>
        </div>

        {/* Principles */}
        <div className="mt-16">
          <h2 className="text-lg font-semibold text-foreground">Principles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.number} className="surface flex gap-4 p-5">
                <span className="data-mono text-xs font-medium text-foreground-muted">
                  {p.number}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground-secondary">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why this matters */}
        <div className="mt-16 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Why this matters
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground-secondary sm:text-base">
                AI agents are transitioning from tools that suggest actions to
                agents that execute them — including financial transactions.
                An agent that can buy compute, settle invoices, or pay suppliers
                needs the same governance that any financial system requires.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground-secondary sm:text-base">
                Warden provides that governance layer without introducing custody
                risk. Agents keep their funds. Policies are enforced on-chain.
                Every decision is recorded. And when something goes wrong, the
                admin can pause everything with a single click.
              </p>
            </div>

            <div className="surface p-6">
              <h3 className="text-sm font-semibold text-foreground">Stack</h3>
              <div className="mt-4 flex flex-col gap-3">
                {STACK.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                    <span className="text-xs text-foreground-secondary">{item.label}</span>
                    <span className="data-mono text-xs text-foreground">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Open source */}
        <div className="mt-16 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Open source
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground-secondary sm:text-base">
                Warden is open source. Every smart contract, every API route,
                every frontend component is available for inspection. Trust is
                not a marketing claim — it is a verifiable property of the code.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="https://github.com/anomalyco/warden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost text-xs"
                >
                  View on GitHub
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 8.5l5-5M4 3.5h4.5V8" />
                  </svg>
                </a>
                <a href="/dashboard" className="btn btn-primary text-xs">
                  Open Dashboard
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="surface p-5">
                <div className="text-xs font-semibold text-foreground">Built with</div>
                <div className="mt-1 text-xs text-foreground-secondary">
                  Next.js 16, React 19, Tailwind v4, Fastify 5, Prisma 7,
                  Solidity, Foundry, viem
                </div>
              </div>
              <div className="surface p-5">
                <div className="text-xs font-semibold text-foreground">Deployed on</div>
                <div className="mt-1 text-xs text-foreground-secondary">
                  Arc blockchain with native USDC settlement
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
