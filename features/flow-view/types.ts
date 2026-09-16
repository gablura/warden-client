export interface AgentSummary {
  address: string;
  label: string | null;
  dailyCap: string;   // stringified BigInt, base USDC units
  perTxCap: string;
  spentToday: string;
  status: string;
}

export interface FeedEvent {
  agent: string;
  counterparty: string;
  amount: string;      // stringified BigInt, base USDC units
  decision: string;    // "approved" | "escalated" | "blocked: <reason>"
  timestamp: string;
}

export interface LiveMessage {
  type:
    | "payment_approved"
    | "payment_blocked"
    | "payment_escalated"
    | "approval_resolved"
    | "policy_set"
    | "allowlist_updated";
  agent?: string;
  counterparty?: string;
  amount?: string;
  reason?: string;
  requestId?: string;
  decision?: string;
}

export type FlowTone = "success" | "warning" | "danger" | "neutral";