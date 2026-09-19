export interface AgentRecord {
  address: string;
  label: string | null;
  dailyCap: string;
  perTxCap: string;
  escalationThreshold: string;
  spentToday: string;
  activeReserved: string;
  reservedUntil: string;
  remainingToday: string;
  lastResetDay: string;
  currentDay: string;
  status: string;
  nearCap: boolean;
  policyExists: boolean;
  policySource: "chain";
  blockNumber: string;
  /// Newest audit-trail timestamp for this agent (null when it has never
  /// produced an event). Server-sourced from the events table.
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string | null;
}

export interface AgentListResponse {
  data: AgentRecord[];
  hasMore: boolean;
}

export interface AgentDetailResponse {
  agent: AgentRecord;
  recentPayments: {
    data: AgentPayment[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface AgentPayment {
  id: number;
  agent: string;
  counterparty: string;
  amount: string;
  decision: string;
  timestamp: string;
  txHash: string | null;
}

export interface SetPolicyInput {
  agent: string;
  dailyCap: bigint;
  perTxCap: bigint;
  escalationThreshold: bigint;
}

export interface SetAllowlistInput {
  agent: string;
  counterparty: string;
  allowed: boolean;
}

export interface AllowlistEntry {
  agent: string;
  counterparty: string;
  allowed: boolean;
}

export interface TxResult {
  txHash: string;
  signer?: string;
  via?: string;
  correlationId?: string;
}
