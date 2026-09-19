"use client";

import { AgentIdentityHeader } from "./agent-identity-header";
import { SpendDial } from "./spend-dial";
import { PolicyEditor } from "./policy-editor";
import { AllowlistEditor } from "./allowlist-editor";
import { DataTable } from "@/components/shared";
import type { Column } from "@/components/shared";
import { StatusBadge } from "@/components/shared";
import { formatUsdc, shortenAddress } from "@/lib/format";
import type { AllowlistEntry } from "../types";
import type { PendingPolicyView } from "@/lib/warden-api";
import { usePendingPolicy } from "../hooks";

interface PaymentRow {
  id: number;
  agent: string;
  counterparty: string;
  amount: string;
  decision: string;
  timestamp: string;
  txHash?: string | null;
}

const paymentColumns: Column<PaymentRow>[] = [
  {
    key: "decision",
    header: "Decision",
    render: (p) => <StatusBadge decision={p.decision} />,
  },
  {
    key: "counterparty",
    header: "Counterparty",
    render: (p) => (
      <span className="data-mono text-xs">{shortenAddress(p.counterparty)}</span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    className: "w-28",
    render: (p) => (
      <span className="data-mono text-xs">{formatUsdc(p.amount)}</span>
    ),
  },
  {
    key: "timestamp",
    header: "Time",
    className: "w-24",
    render: (p) => (
      <span className="text-xs text-foreground-muted">
        {new Date(p.timestamp).toLocaleTimeString()}
      </span>
    ),
  },
];

interface AgentPassportProps {
  agent: {
    address: string;
    label: string | null;
    dailyCap: string;
    perTxCap: string;
    spentToday: string;
    policyExists?: boolean;
    escalationThreshold?: string;
    blockNumber?: string;
  };
  recentPayments: PaymentRow[];
  /// Indexer-mirrored allowlist rows for this agent (see GET /agents/:address).
  allowlist?: AllowlistEntry[];
  onPolicySubmit: (input: {
    agent: string;
    dailyCap: bigint;
    perTxCap: bigint;
    escalationThreshold: bigint;
  }) => void;
  policySubmitting?: boolean;
  /// Callback when admin clicks "Apply scheduled increase" (only shown when pendingPolicy.isReady)
  onApplyPending?: (agentAddress: string) => void;
  applyPendingSubmitting?: boolean;
  onAllowlistSubmit: (input: { agent: string; counterparty: string; allowed: boolean }) => void;
  allowlistSubmitting?: boolean;
  allowlistError?: string | null;
}

export function AgentPassport({
  agent,
  recentPayments,
  allowlist = [],
  onPolicySubmit,
  policySubmitting,
  onAllowlistSubmit,
  allowlistSubmitting,
  allowlistError,
}: AgentPassportProps) {
  // Fetch pending policy for this agent
  const { data: pendingPolicy } = usePendingPolicy(agent.address);

  return (
    <div className="space-y-6">
      <AgentIdentityHeader agent={agent} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="surface flex flex-col items-center p-6">
          <SpendDial
            spent={BigInt(agent.spentToday || "0")}
            cap={BigInt(agent.dailyCap || "0")}
          />
        </div>

        <div className="surface p-6">
          <h3 className="mb-3 text-xs font-medium text-foreground-secondary">Policy</h3>
          <PolicyEditor
            agent={agent}
            pendingPolicy={pendingPolicy ?? null}
            onSubmit={onPolicySubmit}
            onApplyPending={(addr) => console.log("apply pending", addr)} // will be overridden by page
            submitting={policySubmitting}
          />
        </div>
      </div>

      <div className="surface p-6">
        <h3 className="mb-3 text-xs font-medium text-foreground-secondary">Allowlist</h3>
        <AllowlistEditor
          agentAddress={agent.address}
          entries={allowlist}
          onSubmit={onAllowlistSubmit}
          submitting={allowlistSubmitting}
          error={allowlistError}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-medium text-foreground-secondary">Recent activity</h3>
        {recentPayments.length === 0 ? (
          <div className="surface p-6 text-center text-xs text-foreground-muted">
            No recent payments.
          </div>
        ) : (
          <DataTable
            columns={paymentColumns}
            data={recentPayments}
            keyExtractor={(p) => String(p.id)}
          />
        )}
      </div>
    </div>
  );
}
