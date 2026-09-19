"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { WardenApiError } from "@/lib/warden-api";
import { EmptyState } from "@/components/shared";
import { ApprovalCard } from "@/features/approval-inbox/components/approval-card";
import { useApprovalQueue } from "@/features/approval-inbox/hooks/useApprovalQueue";
import { useResolveApproval } from "@/features/approval-inbox/hooks/useResolveApproval";
import { useLiveApprovals } from "@/features/approval-inbox/hooks/useLiveApprovals";
import { approvalKeys } from "@/features/approval-inbox/constants/queryKeys";

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

export default function ApprovalsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const api = useWardenClient();
  const router = useRouter();
  const qc = useQueryClient();

  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/sign-in");
  }, [isAuthenticated, authLoading, router]);

  // Resolve org
  useEffect(() => {
    if (!isAuthenticated || authLoading || orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await api.getMe();
        if (cancelled) return;
        const first = me.memberships[0]?.org;
        if (first) setOrgId(first.id);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, authLoading, orgId, api]);

  const {
    data: serverQueue,
    isLoading: queueLoading,
    error: queueError,
  } = useApprovalQueue(orgId ?? "");

  // Live layer: seeded from the server list, new escalations and resolutions
  // applied over WebSocket so the queue moves without waiting for the
  // refetch (same pattern as the flow view's useLiveFeed).
  const queue = useLiveApprovals(serverQueue);

  const resolveMutation = useResolveApproval(orgId ?? "");

  const items = queue?.data ?? [];
  const staleRead = queue?.staleRead ?? false;
  const loadError = queueError ? explainError(queueError) : "";

  if (authLoading || queueLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-foreground-muted">Loading approvals...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!orgId) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Approvals</h1>
        <div className="surface p-8 text-center">
          <p className="text-sm text-foreground-muted">
            Join or create an organization first —{" "}
            <a href="/dashboard" className="link">
              go to dashboard
            </a>
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
        <div
          className="rounded-lg border border-danger p-3 text-xs"
          style={{ backgroundColor: "var(--color-danger-subtle)", color: "var(--color-danger)" }}
        >
          {loadError}{" "}
          <button
            type="button"
            onClick={() => qc.invalidateQueries({ queryKey: approvalKeys.queue(orgId) })}
            className="link ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {staleRead && items.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-3 text-xs text-foreground-secondary">
          Indexer is catching up — some rows may already be resolved on-chain. Tapping
          one will confirm before spending gas.
        </div>
      )}

      {items.length === 0 && !loadError ? (
        <EmptyState message="Nothing pending. You're caught up." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ApprovalCard
              key={item.requestId}
              item={item}
              onApprove={(id) => resolveMutation.mutate({ requestId: id, decision: "approve" })}
              onReject={(id) => resolveMutation.mutate({ requestId: id, decision: "reject" })}
              resolving={resolveMutation.isPending ? (resolveMutation.variables?.decision as "approve" | "reject") : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
