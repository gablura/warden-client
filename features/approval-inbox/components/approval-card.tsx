"use client";

import { memo, useState } from "react";
import { formatUsdc, shortenAddress } from "@/lib/format";
import { ConfirmInline, RoleGate } from "@/components/shared";
import type { ApprovalItem } from "../types";

function ageFromNow(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function isAging(dateStr: string): boolean {
  const ms = Date.now() - new Date(dateStr).getTime();
  return ms > 3600000; // > 1 hour
}

interface ApprovalCardProps {
  item: ApprovalItem;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  resolving?: "approve" | "reject";
}

function ApprovalCardInner({ item, onApprove, onReject, resolving }: ApprovalCardProps) {
  const [showReason, setShowReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const working = !!resolving;

  const wouldFit = item.wouldFitNow !== false;
  const capWarning = !wouldFit && item.policyExists;

  return (
    <div className="surface space-y-3 p-4">
      {/* Amount - large and prominent per spec */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="data-mono text-xl font-semibold text-foreground">
            {formatUsdc(item.amount)}
          </div>
          <div className="data-mono mt-1 text-xs text-foreground-muted">
            {shortenAddress(item.agent)} → {shortenAddress(item.counterparty)}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`text-xs ${isAging(item.createdAt) ? "text-warning" : "text-foreground-muted"}`}
          >
            {ageFromNow(item.createdAt)}
          </span>
          <span className="data-mono text-xs text-foreground-muted">
            #{item.requestId}
          </span>
        </div>
      </div>

      {/* Cap-fit indicator — wouldFitNow is the server's reservation-aware
          read of the chain state (spend + live reservations vs. cap); the
          card never recomputes it. remainingToday is shown as context so an
          approver can see the actual headroom behind the verdict. */}
      {capWarning && (
        <div className="rounded-md bg-warning-subtle px-2.5 py-1.5 text-xs text-warning">
          Would exceed remaining daily cap
          {item.remainingToday !== undefined && ` — ${formatUsdc(item.remainingToday)} left today`}
        </div>
      )}
      {wouldFit && item.policyExists && (
        <div className="rounded-md bg-success-subtle px-2.5 py-1.5 text-xs text-success">
          Fits within remaining cap
          {item.remainingToday !== undefined && ` — ${formatUsdc(item.remainingToday)} left today`}
        </div>
      )}
      {!item.policyExists && (
        <div className="rounded-md bg-border px-2.5 py-1.5 text-xs text-foreground-muted">
          No policy registered — cannot verify cap
        </div>
      )}

      {/* Actions — approver+ only. Viewers see the card and its readouts
          but the action buttons never render for them at all (per the
          dashboard spec: not disabled, absent). */}
      <RoleGate minRole="approver">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {/* Reject with optional reason */}
            {showReason ? (
              <div className="flex flex-1 gap-1">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="input h-10 flex-1 text-xs"
                  autoFocus
                />
                <button
                  type="button"
                  disabled={working}
                  onClick={() => {
                    onReject(item.requestId);
                    setShowReason(false);
                    setRejectReason("");
                  }}
                  className="btn h-10 shrink-0 px-4 text-xs"
                >
                  {resolving === "reject" ? "..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReason(false); setRejectReason(""); }}
                  className="btn btn-ghost h-10 px-2 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={working}
                onClick={() => setShowReason(true)}
                className="btn h-10 px-4 text-xs"
              >
                Reject
              </button>
            )}

            {/* Approve with ConfirmInline */}
            <ConfirmInline onConfirm={() => onApprove(item.requestId)}>
              {({ confirming, onClick }) => (
                <button
                  type="button"
                  disabled={working}
                  onClick={onClick}
                  className={`btn h-10 px-4 text-xs ${confirming ? "btn-primary" : "btn-primary"}`}
                >
                  {resolving === "approve"
                    ? "Approving..."
                    : confirming
                      ? "Tap again to confirm"
                      : "Approve"}
                </button>
              )}
            </ConfirmInline>
          </div>
        </div>
      </RoleGate>
    </div>
  );
}

export const ApprovalCard = memo(ApprovalCardInner);
