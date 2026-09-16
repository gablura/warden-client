"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { OrgSelector } from "@/features/org/OrgSelector";
import { FlowView } from "@/features/flow-view/components/FlowView";
import type { WardenOrg, AgentView, AuditEvent, ApprovalItem } from "@/lib/warden-api";
import type { AgentSummary, FeedEvent } from "@/features/flow-view/types";

function shortAddress(addr: string): string {
  return addr.length > 13 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{org.name}</h1>
          <p className="data-mono mt-1 text-xs text-foreground-muted">{org.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {wallet?.status && (
            <span
              className="status-badge"
              data-status={wallet.status === "ready" ? "approved" : "pending"}
              title={wallet.address ?? `Wallet ${wallet.status}`}
            >
              {wallet.status === "ready" && wallet.address
                ? `Wallet ${shortAddress(wallet.address)}`
                : `Wallet ${wallet.status}`}
            </span>
          )}
          {org.verified && (
            <span className="status-badge" data-status="approved">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Flow visualization: SVG graph + ticker + dials, all live-updated */}
      <FlowView
        initialAgents={initialAgents}
        initialEvents={initialEvents}
        initialPendingCount={pending.length}
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/agents" className="surface block p-4 transition-colors hover:bg-surface-raised">
          <div className="text-xs font-medium text-foreground-secondary">Agents</div>
          <div className="data-mono mt-2 text-2xl font-semibold text-foreground">{agents.length}</div>
          <span className="link mt-2 block text-xs">View all</span>
        </Link>
        <Link href="/dashboard/approvals" className="surface block p-4 transition-colors hover:bg-surface-raised">
          <div className="text-xs font-medium text-foreground-secondary">Pending Approvals</div>
          <div className="data-mono mt-2 text-2xl font-semibold text-foreground">{pending.length}</div>
          <span className="link mt-2 block text-xs">Review queue</span>
        </Link>
        <Link href="/dashboard/audit" className="surface block p-4 transition-colors hover:bg-surface-raised">
          <div className="text-xs font-medium text-foreground-secondary">Recent Events</div>
          <div className="data-mono mt-2 text-2xl font-semibold text-foreground">{audit.length}</div>
          <span className="link mt-2 block text-xs">View log</span>
        </Link>
      </div>
    </div>
  );
}
