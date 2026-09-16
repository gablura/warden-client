export interface ApprovalItem {
  requestId: string;
  agent: string;
  counterparty: string;
  amount: string;
  resolved: boolean;
  createdAt: string;
  remainingToday?: string;
  policyExists?: boolean;
  wouldFitNow?: boolean;
}

export interface ApprovalsResponse {
  data: ApprovalItem[];
  hasMore: boolean;
  staleRead: boolean;
  indexerLag: number | null;
}

export interface DecisionResult {
  txHash: string;
  signer?: string;
  via?: string;
  correlationId?: string;
}
