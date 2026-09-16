"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { OrgSelector } from "@/features/org/OrgSelector";
import { useLiveFeed } from "@/features/flow-view/hooks/useLiveFeed";
import type { WardenOrg, AgentView, AuditEvent, ApprovalItem } from "@/lib/warden-api";
import type { FlowTone } from "@/features/flow-view/types";

function shortAddress(addr: string): string {
  return addr.length > 13 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

/// Amounts travel as stringified BigInt in base USDC units (6 decimals).
/// BigInt() function form (not literals) — the client targets pre-ES2020.
function formatUsdc(base: string): string {
  try {
    const v = BigInt(base || "0");
    const whole = v / BigInt(1000000);
    const frac = (v % BigInt(1000000)).toString().padStart(6, "0").slice(0, 2);
    return `${whole}.${frac} USDC`;
  } catch {
    return base;
  }
}

function decisionTone(decision: string): FlowTone {
  if (decision === "approved") return "success";
  if (decision === "escalated") return "warning";
  if (decision.startsWith("blocked")) return "danger";
  return "neutral";
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

  // Initial profile + org bootstrap (unchanged behavior).
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

  // Seed the dashboard from the org-scoped REST surfaces. The live feed
  // (below) layers real-time updates on top of this snapshot.
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

  // The live feed: seeded from the snapshot above, updated in real time by
  // the deployment-scoped /ws connection (ticket-authenticated per connect).
  const feed = useLiveFeed(
    {
      agents: agents.map((a) => ({
        address: a.address,
        label: a.label,
        dailyCap: a.dailyCap,
        perTxCap: a.perTxCap,
        spentToday: a.spentToday,
        status: a.status,
      })),
      events: audit.map((e) => ({
        agent: e.agent,
        counterparty: e.counterparty,
        amount: e.amount,
        decision: e.decision,
        timestamp: e.timestamp,
      })),
      pendingCount: pending.length,
    },
    api,
  );

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="surface p-4">
          <div className="text-xs font-medium text-foreground-secondary">Agents</div>
          <div className="data-mono mt-2 text-2xl font-semibold text-foreground">{feed.agents.length}</div>
          <a href="/dashboard/agents" className="link mt-2 block text-xs">
            View all
          </a>
        </div>
        <div className="surface p-4">
          <div className="text-xs font-medium text-foreground-secondary">Pending Approvals</div>
          <div className="data-mono mt-2 text-2xl font-semibold text-foreground">{feed.pendingCount}</div>
          <a href="/dashboard/approvals" className="link mt-2 block text-xs">
            Review queue
          </a>
        </div>
        <div className="surface p-4">
          <div className="text-xs font-medium text-foreground-secondary">Recent Events</div>
          <div className="data-mono mt-2 text-2xl font-semibold text-foreground">{feed.events.length}</div>
          <a href="/dashboard/audit" className="link mt-2 block text-xs">
            View log
          </a>
        </div>
      </div>

      <div className="surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Live Activity</h2>
          <span className="text-xs text-foreground-muted" title="Updates arrive over the scoped WebSocket feed">
            live
          </span>
        </div>
        {feed.events.length === 0 ? (
          <p className="mt-4 text-xs text-foreground-muted">No activity yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {feed.events.slice(0, 8).map((event, i) => (
              <li key={`${event.timestamp}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="status-badge shrink-0" data-status={decisionTone(event.decision)}>
                    {event.decision}
                  </span>
                  <span className="data-mono truncate text-xs text-foreground">{shortAddress(event.agent)}</span>
                  <span className="hidden truncate text-xs text-foreground-muted sm:inline">
                    → {shortAddress(event.counterparty)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="data-mono text-xs text-foreground">{formatUsdc(event.amount)}</span>
                  <span className="text-xs text-foreground-muted">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="surface p-6">
        <h2 className="text-sm font-semibold text-foreground">Quick Start</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs text-foreground-muted">
              1
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Register your first agent</div>
              <div className="text-xs text-foreground-secondary">Use setPolicy on-chain to register an agent address</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs text-foreground-muted">
              2
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Configure spend limits</div>
              <div className="text-xs text-foreground-secondary">Set per-agent and per-policy spending caps</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs text-foreground-muted">
              3
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Invite approvers</div>
              <div className="text-xs text-foreground-secondary">Add team members who can sign transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
