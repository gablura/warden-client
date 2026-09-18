"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { OrgSelector } from "@/features/org/OrgSelector";
import { FlowView } from "@/features/flow-view/components/FlowView";
import { WalletCard } from "@/features/dashboard/components/WalletCard";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { formatUsdc } from "@/lib/format";
import type { WardenOrg, AgentView, AuditEvent, ApprovalItem } from "@/lib/warden-api";
import type { AgentSummary, FeedEvent } from "@/features/flow-view/types";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const api = useWardenClient();
  const router = useRouter();
  const [org, setOrg] = useState<WardenOrg | null>(null);
  const [wallet, setWallet] = useState<{ address?: string | null; status?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentView[]>([]);
  const [pending, setPending] = useState<ApprovalItem[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleOrgSelected = (selected: WardenOrg) => {
    setOrg(selected);
    setLoading(false);
  };

  // Initial profile + org bootstrap.
  useEffect(() => {
    if (!isAuthenticated || isLoading || org) return;
    let cancelled = false;
    (async () => {
      try {
        const [list, me] = await Promise.all([api.listOrgs(), api.getMe()]);
        if (cancelled) return;
        setWallet({ address: me.walletAddress, status: me.walletStatus });
        if (list.length === 0) {
          setLoading(false);
        } else if (list.length === 1 && list[0]) {
          setOrg(list[0]);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, org, api]);

  // Seed the dashboard from the org-scoped REST surfaces.
  useEffect(() => {
    if (!isAuthenticated || isLoading || !org) return;
    let cancelled = false;
    (async () => {
      try {
        const [agentPage, approvalPage, recentAudit] = await Promise.all([
          api.listAgents(org.id),
          api.listApprovals(org.id),
          api.listAudit(org.id, 15).catch(() => [] as AuditEvent[]),
        ]);
        if (cancelled) return;
        setAgents(agentPage.data);
        setPending(approvalPage.data);
        setAudit(recentAudit);
      } catch {
        // Counters stay at their last values; the live feed may still fill in.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, org, api]);

  // Map API data to FlowView types.
  const initialAgents: AgentSummary[] = agents.map((a) => ({
    address: a.address,
    label: a.label,
    dailyCap: a.dailyCap,
    perTxCap: a.perTxCap,
    spentToday: a.spentToday,
    status: a.status,
  }));

  const initialEvents: FeedEvent[] = audit.map((e) => ({
    agent: e.agent,
    counterparty: e.counterparty,
    amount: e.amount,
    decision: e.decision,
    timestamp: e.timestamp,
  }));

  // Compute summary metrics
  const totalDailySpend = agents.reduce((sum, a) => {
    try {
      return sum + BigInt(a.spentToday || "0");
    } catch {
      return sum;
    }
  }, BigInt(0));

  const approvedCount = audit.filter((e) => e.decision === "approved").length;
  const blockedCount = audit.filter((e) => e.decision.startsWith("blocked")).length;
  const escalatedCount = audit.filter((e) => e.decision === "escalated").length;

  if (isLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-foreground-muted">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!org) {
    return <OrgSelector onComplete={handleOrgSelected} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{org.name}</h1>
          <p className="data-mono mt-1 text-xs text-foreground-muted">{org.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {org.verified && (
            <span className="status-badge" data-status="approved">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Wallet + Summary row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Wallet card */}
        <WalletCard
          address={wallet?.address}
          status={wallet?.status}
          orgId={org.id}
        />

        {/* Agents card */}
        <Link
          href="/dashboard/agents"
          className="surface group relative overflow-hidden transition-all hover:shadow-md"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-info" />
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-subtle">
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    stroke="var(--color-info)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="4" width="8" height="8" rx="1" />
                    <line x1="6" y1="2" x2="6" y2="4" />
                    <line x1="10" y1="2" x2="10" y2="4" />
                    <line x1="6" y1="12" x2="6" y2="14" />
                    <line x1="10" y1="12" x2="10" y2="14" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground-secondary">
                  Agents
                </span>
              </div>
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 text-foreground-muted transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </div>
            <div className="data-mono text-2xl font-semibold text-foreground">
              {agents.length}
            </div>
            <div className="mt-1 text-[10px] text-foreground-muted">
              {formatUsdc(totalDailySpend)} spent today
            </div>
          </div>
        </Link>

        {/* Pending Approvals card */}
        <Link
          href="/dashboard/approvals"
          className="surface group relative overflow-hidden transition-all hover:shadow-md"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-warning" />
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-warning-subtle">
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    stroke="var(--color-warning)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="8" r="6" />
                    <polyline points="5.5 8 7 9.5 10.5 6.5" />
                  </svg>
                  {pending.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-warning text-[8px] font-bold text-white">
                      {pending.length > 9 ? "9+" : pending.length}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-foreground-secondary">
                  Pending
                </span>
              </div>
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 text-foreground-muted transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </div>
            <div className="data-mono text-2xl font-semibold text-foreground">
              {pending.length}
            </div>
            <div className="mt-1 text-[10px] text-foreground-muted">
              Awaiting review
            </div>
          </div>
        </Link>

        {/* Events card */}
        <Link
          href="/dashboard/audit"
          className="surface group relative overflow-hidden transition-all hover:shadow-md"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-success" />
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-subtle">
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="3" y1="4" x2="13" y2="4" />
                    <line x1="3" y1="8" x2="13" y2="8" />
                    <line x1="3" y1="12" x2="13" y2="12" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground-secondary">
                  Events
                </span>
              </div>
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 text-foreground-muted transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </div>
            <div className="data-mono text-2xl font-semibold text-foreground">
              {audit.length}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-foreground-muted">
              <span className="text-success">{approvedCount} approved</span>
              <span className="text-warning">{escalatedCount} escalated</span>
              <span className="text-danger">{blockedCount} blocked</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Flow visualization: SVG graph + ticker + dials, all live-updated */}
      <FlowView
        initialAgents={initialAgents}
        initialEvents={initialEvents}
        initialPendingCount={pending.length}
      />

      {/* Recent Activity feed */}
      <RecentActivity events={audit} maxItems={5} />
    </div>
  );
}
