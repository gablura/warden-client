import type { Metadata } from "next";
import { FeatureSection } from "@/features/landing/components/FeatureSection";
import {
  PolicyVisual,
  ApprovalVisual,
  SettlementVisual,
  AuditVisual,
  MonitoringVisual,
  EmergencyVisual,
} from "@/features/landing/components/FeatureVisuals";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything Warden provides to govern AI agent spending — policy engine, approval workflows, non-custodial settlement, audit trails, real-time monitoring, and emergency controls.",
};

const FEATURES = [
  {
    number: "01",
    title: "Policy Engine",
    description:
      "Define granular spending rules per agent. Set daily caps, per-transaction limits, and role-based access controls — all enforced on-chain through smart contracts, not server-side checks that can be bypassed.",
    details: [
      "Daily spending caps with automatic UTC reset",
      "Per-transaction limits for large-payment guardrails",
      "Role-based access: operators, approvers, guards",
      "Timelock on policy changes — cap increases take 24 hours",
      "Global daily ceiling across all agents",
    ],
    tone: "success" as const,
    visual: <PolicyVisual />,
  },
  {
    number: "02",
    title: "Approval Workflows",
    description:
      "When an agent hits its limits, payments escalate to human approvers. Warden detects collisions before gas is spent — if two pending requests would together exceed the daily cap, the second one is flagged.",
    details: [
      "Multi-tier escalation with configurable thresholds",
      "Collision detection: know before you approve",
      "Scope enforcement per approver credential",
      "Correlation IDs for full traceability",
      "Stale-read detection when the indexer is lagging",
    ],
    tone: "warning" as const,
    reverse: true,
    visual: <ApprovalVisual />,
  },
  {
    number: "03",
    title: "Non-Custodial Settlement",
    description:
      "Warden never holds agent funds. SpendGuard is granted a USDC allowance and pulls approved amounts directly from agent wallets. Nothing is ever pooled, escrowed, or custodied.",
    details: [
      "Agents keep full custody of their funds",
      "SpendGuard pulls only what is explicitly approved",
      "Atomic settlement — transfer failure reverts everything",
      "Reentrancy guard on all external calls",
      "Emergency pause freezes settlement without affecting rejections",
    ],
    tone: "info" as const,
    visual: <SettlementVisual />,
  },
  {
    number: "04",
    title: "Audit Trail",
    description:
      "Every decision — approved, blocked, escalated, rejected — is recorded on-chain through the AuditLog contract and indexed into a searchable database. Who did what, when, and why.",
    details: [
      "On-chain recording via AuditLog contract",
      "Indexed database for fast search and filtering",
      "Correlation IDs tie frontend actions to on-chain records",
      "CSV export for compliance reporting",
      "Operator actions tracked with credential identity",
    ],
    tone: "neutral" as const,
    reverse: true,
    visual: <AuditVisual />,
  },
  {
    number: "05",
    title: "Real-Time Monitoring",
    description:
      "A live WebSocket feed broadcasts every payment event as it happens. The dashboard shows current spend, pending approvals, and system health — all updated in real time.",
    details: [
      "WebSocket push for instant visibility",
      "Per-agent spend tracking with live updates",
      "System health: indexer lag, chain head, agent status",
      "Near-cap warnings before limits are hit",
      "Stale-read indicators when the indexer falls behind",
    ],
    tone: "success" as const,
    visual: <MonitoringVisual />,
  },
  {
    number: "06",
    title: "Emergency Stop",
    description:
      "When something goes wrong, the admin can freeze all settlement immediately. Rejection still works while paused — approvers can empty the queue without moving money.",
    details: [
      "One-click pause on all settlement",
      "Rejections stay available during pause",
      "No redeploy needed — immediate effect",
      "Policy reads still work during pause",
      "Admin can resume when the incident is resolved",
    ],
    tone: "danger" as const,
    reverse: true,
    visual: <EmergencyVisual />,
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Page header */}
      <div className="border-b border-border py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              Product
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Features
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-foreground-secondary sm:text-base">
              Six capabilities that cover the full lifecycle of agent spending —
              from policy definition through settlement to post-mortem audit.
            </p>
          </div>
        </div>
      </div>

      {/* Feature sections */}
      {FEATURES.map((feature) => (
        <FeatureSection
          key={feature.number}
          number={feature.number}
          title={feature.title}
          description={feature.description}
          details={feature.details}
          tone={feature.tone}
          reverse={feature.reverse}
          visual={feature.visual}
        />
      ))}

      {/* Bottom CTA */}
      <div className="border-t border-border py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-sm text-foreground-secondary">
            Every feature is backed by on-chain smart contracts.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <a href="/about" className="btn btn-ghost text-xs">
              Learn why
            </a>
            <a href="/dashboard" className="btn btn-primary text-xs">
              Open Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
