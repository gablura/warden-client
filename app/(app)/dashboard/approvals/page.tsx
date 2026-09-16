"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { WardenApiError, type ApprovalItem, type WardenOrg } from "@/lib/warden-api";
import { formatUsdc, shortenAddress } from "@/lib/format";

type RowState =
  | { status: "idle" }
  | { status: "working"; decision: "approve" | "reject" }
  | { status: "done"; txHash: string; via?: string }
  | { status: "error"; message: string };

function explainError(err: unknown): string {
  if (err instanceof WardenApiError) {
    if (err.status === 403 && err.code === "onchain_grant_missing") {
      return "Your wallet has no on-chain approver grant yet — ask an admin to sync approvers.";
    }
    if (err.status === 409) return "Already resolved on-chain by someone else.";
    if (err.status === 404) return "Request no longer exists.";
    if (err.status === 503) return "Chain temporarily unavailable — retry in a moment.";
    if (err.status === 403 && err.code === "verification_required") {
      return "Mainnet action blocked: your organization is not verified yet.";
    }
    if (err.status === 403) return "Insufficient permissions for this action.";
    return err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

/**
 * Approval inbox (§2 + §6): one tap per decision, no wallet popup, no gas
 * decision. The tap authorizes with the org-scoped session; the server
 * submits from the approver's own embedded wallet via Circle when
 * available (relayer otherwise), and the result names the signer.
 */
export default function ApprovalsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const api = useWardenClient();
  const router = useRouter();

  const [org, setOrg] = useState<WardenOrg | null>(null);
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [staleRead, setStaleRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [rows, setRows] = useState<Record<string, RowState>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  const refresh = useCallback(async () => {
    try {
      const me = await api.getMe();
      const firstOrg = me.memberships[0]?.org ?? null;
      if (!firstOrg) {
        setOrg(null);
        setLoading(false);
        return;
      }
      setOrg({ ...firstOrg });
      const res = await api.listApprovals(firstOrg.id);
      setItems(res.data);
      setStaleRead(res.staleRead);
      setLoadError("");
    } catch (err) {
      setLoadError(explainError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) void refresh();
  }, [isAuthenticated, isLoading, refresh]);

  const decide = useCallback(
    async (item: ApprovalItem, decision: "approve" | "reject") => {
      if (!org) return;
      setRows((r) => ({ ...r, [item.requestId]: { status: "working", decision } }));
      try {
        const res = decision === "approve"
          ? await api.approve(org.id, item.requestId)
          : await api.reject(org.id, item.requestId);
        setRows((r) => ({ ...r, [item.requestId]: { status: "done", txHash: res.txHash, via: res.via } }));
        // Drop the resolved row — the chain is the arbiter, the tap succeeded.
        setItems((list) => list.filter((x) => x.requestId !== item.requestId));
      } catch (err) {
        setRows((r) => ({ ...r, [item.requestId]: { status: "error", message: explainError(err) } }));
      }
    },
    [api, org],
  );

  if (isLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-foreground-muted">Loading approvals...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!org) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Approvals</h1>
        <div className="surface p-8 text-center">
          <p className="text-sm text-foreground-muted">
            Join or create an organization first — <a href="/dashboard" className="link">go to dashboard</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Approvals</h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Review and sign pending agent requests — one tap, no gas decisions
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-danger p-3 text-xs" style={{ backgroundColor: "var(--color-danger-subtle)", color: "var(--color-danger)" }}>
          {loadError} <button type="button" onClick={() => { setLoading(true); void refresh(); }} className="link ml-2">Retry</button>
        </div>
      )}

      {staleRead && items.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-3 text-xs text-foreground-secondary">
          Indexer is catching up — some rows may already be resolved on-chain. Tapping one will confirm before spending gas.
        </div>
      )}

      {items.length === 0 && !loadError ? (
        <div className="surface p-8 text-center">
          <p className="text-sm text-foreground-muted">Queue is empty — nothing waiting for review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const state = rows[item.requestId] ?? { status: "idle" };
            const working = state.status === "working";
            return (
              <div key={item.requestId} className="surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="data-mono text-lg font-semibold text-foreground">
                      {formatUsdc(item.amount)}
                    </div>
                    <div className="data-mono mt-1 text-xs text-foreground-muted">
                      {shortenAddress(item.agent)} → {shortenAddress(item.counterparty)}
                    </div>
                    <div className="mt-1 text-xs text-foreground-secondary">
                      Request #{item.requestId}
                      {item.wouldFitNow === false && (
                        <span className="ml-2 text-foreground-muted">· may exceed remaining cap</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void decide(item, "reject")}
                      className="btn h-9 px-4 text-sm"
                    >
                      {working && state.status === "working" && state.decision === "reject" ? "Rejecting..." : "Reject"}
                    </button>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void decide(item, "approve")}
                      className="btn btn-primary h-9 px-4 text-sm"
                    >
                      {working && state.status === "working" && state.decision === "approve" ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
                {state.status === "done" && (
                  <div className="data-mono mt-2 text-xs text-foreground-secondary">
                    Signed{state.via ? ` via ${state.via}` : ""} · {shortenAddress(state.txHash)}
                  </div>
                )}
                {state.status === "error" && (
                  <div className="mt-2 text-xs" style={{ color: "var(--color-danger)" }}>
                    {state.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
