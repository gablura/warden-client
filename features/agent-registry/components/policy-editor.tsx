"use client";

import { useState } from "react";
import { RoleGate } from "@/components/shared";

interface PolicyEditorProps {
  agent: {
    address: string;
    dailyCap: string;
    perTxCap: string;
    escalationThreshold?: string;
  };
  onSubmit: (input: {
    agent: string;
    dailyCap: bigint;
    perTxCap: bigint;
    escalationThreshold: bigint;
  }) => void;
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

export function PolicyEditor({ agent, onSubmit, submitting }: PolicyEditorProps) {
  const [dailyCap, setDailyCap] = useState(() => toUsdc(agent.dailyCap));
  const [perTxCap, setPerTxCap] = useState(() => toUsdc(agent.perTxCap));
  const [escThreshold, setEscThreshold] = useState(() => toUsdc(agent.escalationThreshold ?? "0"));
  const [dirty, setDirty] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perTx = toBaseUnits(perTxCap);
    const daily = toBaseUnits(dailyCap);
    if (perTx > daily || toBaseUnits(escThreshold) > perTx) return;
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
  const validationError =
    perTx > daily ? "Per-tx cap must be ≤ daily cap" :
    esc > perTx ? "Escalation threshold must be ≤ per-tx cap" : null;

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
        {dirty && (
          <button
            type="submit"
            disabled={submitting || !!validationError}
            className="btn btn-primary h-9 w-full text-xs"
          >
            {submitting ? "Submitting on-chain..." : "Update policy"}
          </button>
        )}
      </form>
    </RoleGate>
  );
}
