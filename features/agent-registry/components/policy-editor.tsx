"use client";

import { useState } from "react";
import { RoleGate, ConfirmInline } from "@/components/shared";
import type { PendingPolicyView } from "@/lib/warden-api";

interface PolicyEditorProps {
  agent: {
    address: string;
    dailyCap: string;
    perTxCap: string;
    escalationThreshold?: string;
    spentToday?: string;
    blockNumber?: string;
  };
  /// Pending policy increase (if any), from GET /policies/pending/:agent.
  /// When present and isReady=true, shows an "Apply" button.
  pendingPolicy?: PendingPolicyView | null;
  onSubmit: (input: {
    agent: string;
    dailyCap: bigint;
    perTxCap: bigint;
    escalationThreshold: bigint;
  }) => void;
  onApplyPending?: (agent: string) => void;
  applyPendingSubmitting?: boolean;
  submitting?: boolean;
}

function toUsdc(raw: string): string {
  try {
    return (Number(BigInt(raw || "0")) / 1_000_000).toFixed(2);
  } catch {
    return "0.00";
  }
}

function toBaseUnits(usdc: string): bigint {
  const num = parseFloat(usdc) || 0;
  return BigInt(Math.round(num * 1_000_000));
}

function timeUntil(ts: string): string {
  const now = Date.now();
  const target = Number(ts) * 1000;
  const diff = target - now;
  if (diff <= 0) return "ready";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function PolicyEditor({
  agent,
  pendingPolicy,
  onSubmit,
  onApplyPending,
  applyPendingSubmitting,
  submitting,
}: PolicyEditorProps) {
  const [dailyCap, setDailyCap] = useState(() => toUsdc(agent.dailyCap));
  const [perTxCap, setPerTxCap] = useState(() => toUsdc(agent.perTxCap));
  const [escThreshold, setEscThreshold] = useState(() => toUsdc(agent.escalationThreshold ?? "0"));
  const [dirty, setDirty] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perTx = toBaseUnits(perTxCap);
    const daily = toBaseUnits(dailyCap);
    if (perTx > daily || toBaseUnits(escThreshold) > perTx) return;
    if (!pauseIntent && spentToday !== null && daily < spentToday) return;
    onSubmit({
      agent: agent.address,
      dailyCap: daily,
      perTxCap: perTx,
      escalationThreshold: toBaseUnits(escThreshold),
    });
    setDirty(false);
  };

  const perTx = toBaseUnits(perTxCap);
  const daily = toBaseUnits(dailyCap);
  const esc = toBaseUnits(escThreshold);
  const spentToday = agent.spentToday !== undefined ? BigInt(agent.spentToday || "0") : null;

  // Pause gesture: both caps to zero (no paused flag exists on-chain —
  // zeroed caps make every per-tx check fail). Exempt from the spentToday
  // guard: pausing an agent that already spent today is exactly the point.
  const pauseIntent = daily === BigInt(0) && perTx === BigInt(0);

  const validationError =
    perTx > daily ? "Per-tx cap must be ≤ daily cap" :
    esc > perTx ? "Escalation threshold must be ≤ per-tx cap" :
    !pauseIntent && spentToday !== null && daily < spentToday
      ? "New daily cap is below what this agent has already spent today — wait for the daily reset, or Pause instead"
      : null;

  const isPaused = BigInt(agent.dailyCap || "0") === BigInt(0) && BigInt(agent.perTxCap || "0") === BigInt(0);

  // Pause submits through the same onSubmit the form uses — zero caps, esc
  // 0 — so the "real transaction" path (and its confirmation UX) is shared.
  const submitPausedPolicy = () => {
    onSubmit({
      agent: agent.address,
      dailyCap: BigInt(0),
      perTxCap: BigInt(0),
      escalationThreshold: BigInt(0),
    });
    setDirty(false);
  };

  const pausedBanner = isPaused ? (
    <div className="rounded-md bg-warning-subtle px-2.5 py-1.5 text-xs text-warning">
      Paused — both caps are zero, so every payment attempt is blocked.
      Restore by setting new cap values.
    </div>
  ) : null;

  // Pending policy badge + Apply button
  const pendingBanner = pendingPolicy ? (
    <div className="rounded-md bg-info-subtle px-2.5 py-1.5 text-xs space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-info">⏳ Scheduled increase</span>
        <span className="data-mono text-foreground-muted">
          {pendingPolicy.isReady ? "Ready to apply" : `Effective in ${timeUntil(pendingPolicy.effectiveAt)}`}
        </span>
      </div>
      <div className="data-mono text-[10px] text-foreground-muted">
        → Daily cap: {toUsdc(pendingPolicy.dailyCap)} USDC
      </div>
      {pendingPolicy.isReady && onApplyPending && (
        <ConfirmInline
          onConfirm={() => onApplyPending!(agent.address)}
        >
          {({ confirming, onClick }) => (
            <button
              type="button"
              onClick={applyPendingSubmitting ? undefined : onClick}
              disabled={applyPendingSubmitting}
              className={`h-9 w-full text-xs ${applyPendingSubmitting ? "btn" : confirming ? "btn btn-primary" : "btn btn-outline"}`}
            >
              {applyPendingSubmitting
                ? "Applying..."
                : confirming
                  ? "Tap again to apply scheduled increase"
                  : "Apply scheduled increase"}
            </button>
          )}
        </ConfirmInline>
      )}
    </div>
  ) : null;

  return (
    <RoleGate
      minRole="admin"
      fallback={
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-muted">Daily cap</span>
            <span className="data-mono text-foreground">{toUsdc(agent.dailyCap)} USDC</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-muted">Per-tx cap</span>
            <span className="data-mono text-foreground">{toUsdc(agent.perTxCap)} USDC</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-muted">Escalation threshold</span>
            <span className="data-mono text-foreground">{toUsdc(agent.escalationThreshold ?? "0")} USDC</span>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {pausedBanner}
        {pendingBanner}
        <div>
          <label className="mb-1 block text-xs text-foreground-muted">Daily cap (USDC)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={dailyCap}
            onChange={(e) => { setDailyCap(e.target.value); setDirty(true); }}
            className="input h-9 w-full text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-foreground-muted">Per-tx cap (USDC)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={perTxCap}
            onChange={(e) => { setPerTxCap(e.target.value); setDirty(true); }}
            className="input h-9 w-full text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-foreground-muted">Escalation threshold (USDC)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={escThreshold}
            onChange={(e) => { setEscThreshold(e.target.value); setDirty(true); }}
            className="input h-9 w-full text-xs"
          />
        </div>
        {dirty && validationError && (
          <p className="text-xs text-red-500">{validationError}</p>
        )}
        {dirty && pauseIntent && !submitting && (
          <ConfirmInline onConfirm={submitPausedPolicy}>
            {({ confirming, onClick }) => (
              <button
                type="button"
                onClick={onClick}
                className={`h-9 w-full text-xs ${confirming ? "btn btn-danger" : "btn"}`}
              >
                {confirming ? "Tap again to pause this agent" : "Pause — set both caps to 0"}
              </button>
            )}
          </ConfirmInline>
        )}
        {dirty && pauseIntent && submitting && (
          <button
            type="button"
            disabled
            className="btn h-9 w-full text-xs"
          >
            Pausing...
          </button>
        )}
        {dirty && !pauseIntent && (
          <button
            type="submit"
            disabled={submitting || !!validationError}
            className="btn btn-primary h-9 w-full text-xs"
          >
            {submitting ? "Submitting on-chain..." : "Update policy"}
          </button>
        )}
        <p className="text-[10px] text-foreground-muted">
          Values are read live from the chain and update only once the
          transaction confirms{agent.blockNumber ? ` — verified at block ${agent.blockNumber}` : ""}.
        </p>
      </form>
    </RoleGate>
  );
}
