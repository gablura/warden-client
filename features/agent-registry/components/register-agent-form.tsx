"use client";

import { useState } from "react";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { useAuth } from "@/features/auth/useAuth";
import { formatUsdc } from "@/lib/format";

interface RegisterAgentFormProps {
  orgId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function parseUsdcInput(raw: string): bigint | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 0) return null;
  return BigInt(Math.round(num * 1_000_000));
}

export function RegisterAgentForm({ orgId, onSuccess, onCancel }: RegisterAgentFormProps) {
  const api = useWardenClient();
  const { user } = useAuth();

  const [label, setLabel] = useState("");
  const [dailyCap, setDailyCap] = useState("");
  const [perTxCap, setPerTxCap] = useState("");
  const [escalationThreshold, setEscalationThreshold] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ address: string } | null>(null);

  const dailyCapBigInt = parseUsdcInput(dailyCap);
  const perTxCapBigInt = parseUsdcInput(perTxCap);
  const escalationThresholdBigInt = parseUsdcInput(escalationThreshold);

  const isValid =
    dailyCapBigInt !== null &&
    dailyCapBigInt > BigInt(0) &&
    perTxCapBigInt !== null &&
    perTxCapBigInt > BigInt(0) &&
    escalationThresholdBigInt !== null &&
    escalationThresholdBigInt > BigInt(0) &&
    perTxCapBigInt <= dailyCapBigInt &&
    escalationThresholdBigInt <= perTxCapBigInt;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await api.createAgent({
        orgId,
        label: label.trim() || undefined,
        dailyCap: dailyCapBigInt!,
        perTxCap: perTxCapBigInt!,
        escalationThreshold: escalationThresholdBigInt!,
      });
      setSuccess(result);
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to register agent";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="surface p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-foreground">Agent Registered</h3>
            <p className="mt-1 text-xs text-foreground-secondary">
              Wallet created at <code className="text-xs">{success.address}</code>
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              Policy will be set on-chain once the agent sends its first transaction.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-background-subtle px-3 py-1.5 text-xs font-medium text-foreground-secondary ring-1 ring-border hover:bg-background-muted"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface p-6">
      <h3 className="text-sm font-medium text-foreground">Register New Agent</h3>
      <p className="mt-1 text-xs text-foreground-muted">
        Creates a Circle wallet and registers the agent on-chain.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="agent-label" className="block text-xs font-medium text-foreground-secondary">
            Label <span className="text-foreground-muted">(optional)</span>
          </label>
          <input
            id="agent-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. treasury-bot"
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="daily-cap" className="block text-xs font-medium text-foreground-secondary">
              Daily Cap (USDC)
            </label>
            <input
              id="daily-cap"
              type="number"
              step="0.01"
              min="0"
              value={dailyCap}
              onChange={(e) => setDailyCap(e.target.value)}
              placeholder="1000"
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {dailyCapBigInt !== null && (
              <p className="mt-1 text-[10px] text-foreground-muted">{formatUsdc(dailyCapBigInt)} on-chain</p>
            )}
          </div>

          <div>
            <label htmlFor="per-tx-cap" className="block text-xs font-medium text-foreground-secondary">
              Per-Tx Cap (USDC)
            </label>
            <input
              id="per-tx-cap"
              type="number"
              step="0.01"
              min="0"
              value={perTxCap}
              onChange={(e) => setPerTxCap(e.target.value)}
              placeholder="100"
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {perTxCapBigInt !== null && (
              <p className="mt-1 text-[10px] text-foreground-muted">{formatUsdc(perTxCapBigInt)} on-chain</p>
            )}
          </div>

          <div>
            <label htmlFor="escalation" className="block text-xs font-medium text-foreground-secondary">
              Escalation (USDC)
            </label>
            <input
              id="escalation"
              type="number"
              step="0.01"
              min="0"
              value={escalationThreshold}
              onChange={(e) => setEscalationThreshold(e.target.value)}
              placeholder="500"
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {escalationThresholdBigInt !== null && (
              <p className="mt-1 text-[10px] text-foreground-muted">{formatUsdc(escalationThresholdBigInt)} on-chain</p>
            )}
          </div>
        </div>
      </div>

      {!isValid && dailyCapBigInt !== null && perTxCapBigInt !== null && escalationThresholdBigInt !== null && (
        <div className="mt-3 rounded-md bg-yellow-500/10 p-3 text-xs text-yellow-600">
          {perTxCapBigInt > dailyCapBigInt && "Per-Tx Cap must be ≤ Daily Cap. "}
          {escalationThresholdBigInt > perTxCapBigInt && "Escalation must be ≤ Per-Tx Cap."}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-danger/10 p-3 text-xs text-danger">{error}</div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-background-subtle px-3 py-1.5 text-xs font-medium text-foreground-secondary ring-1 ring-border hover:bg-background-muted"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "Registering..." : "Register Agent"}
        </button>
      </div>
    </form>
  );
}
