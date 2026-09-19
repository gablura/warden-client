"use client";

// Typed client for warden-server implementing the §6 session flow:
//
// - Human (Clerk) mode: the Clerk JWT is exchanged per org for a
//   short-lived scoped token (POST /auth/token, cached to expiry) and sent
//   as `Authorization: Bearer`. Every call carries the actual user + role in
//   the relevant org — never a shared secret.
// - Service (API key) mode: the key travels as `x-api-key`, as before.
//
// All list endpoints unwrap the server's `{ data }` envelope so callers get
// plain arrays.

export interface WardenOrg {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  role?: string;
  treasuryWallet?: string | null;
}

export interface MembershipView {
  org: WardenOrg;
  role: string;
}

export type WalletStatus = "ready" | "pending" | "unavailable";

export interface MeProfile {
  id: string;
  email?: string;
  label: string;
  role?: string;
  walletAddress?: string | null;
  walletId?: string | null;
  externalWalletAddress?: string | null;
  walletStatus?: WalletStatus;
  authMethod: "clerk" | "api_key";
  hasNoOrg?: boolean;
  pendingInvites?: number;
  memberships: MembershipView[];
}

export interface PendingInvite {
  token: string;
  role: string;
  expiresAt: string;
  organization: { id: string; name: string; slug: string };
}

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

export interface AgentView {
  address: string;
  label: string | null;
  dailyCap: string;
  perTxCap: string;
  escalationThreshold?: string;
  spentToday: string;
  /// Live escalation reservations and the cap headroom they leave —
  /// chain-sourced (see policyState.ts). remainingToday is the value the
  /// "can this agent still spend X" question should be answered with.
  activeReserved?: string;
  reservedUntil?: string;
  remainingToday?: string;
  status: string;
  nearCap?: boolean;
  policyExists?: boolean;
  policySource?: "chain";
  blockNumber?: string;
  /// Newest audit-trail timestamp for this agent, or null if it has never
  /// produced an event (server-sourced from the events table).
  lastActivityAt?: string | null;
}

/// One row of the agent's allowlist (agent → counterparty → allowed),
/// mirrored from AllowlistUpdated events. Disallowed entries are retained
/// so an admin can flip them back on without retyping the address.
export interface AllowlistView {
  agent: string;
  counterparty: string;
  allowed: boolean;
}

export interface AgentsResponse {
  data: AgentView[];
  hasMore: boolean;
}

export interface AuditEvent {
  id: number;
  agent: string;
  counterparty: string;
  amount: string;
  decision: string;
  timestamp: string;
  txHash?: string | null;
}

export interface DecisionResult {
  txHash: string;
  signer?: string;
  via?: "circle" | "relayer";
  correlationId?: string;
}

export class WardenApiError extends Error {
  readonly status: number;
  readonly code?: string;
  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = "WardenApiError";
    this.status = status;
    this.code = code;
  }
}

interface ClientOpts {
  getClerkToken: () => Promise<string | null>;
  /** Raw service key when signed in with an API key (not a Clerk session). */
  getServiceKey: () => string | null;
  apiUrl?: string;
}

const SCOPED_SKEW_MS = 30_000;

export function createWardenClient(opts: ClientOpts) {
  const apiUrl = opts.apiUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  // Scoped-token cache per org: Clerk JWT in, 15-min token out.
  const scopedCache = new Map<string, { token: string; expMs: number }>();

  async function request<T>(path: string, init: RequestInit = {}, orgId?: string): Promise<T> {
    const headers = new Headers(init.headers);

    const serviceKey = opts.getServiceKey();
    if (serviceKey) {
      headers.set("x-api-key", serviceKey);
    } else {
      const clerkToken = await opts.getClerkToken();
      if (!clerkToken) throw new WardenApiError(401, "missing_token", "Not signed in");
      if (orgId) {
        headers.set("Authorization", `Bearer ${await scopedToken(orgId, clerkToken)}`);
      } else {
        headers.set("Authorization", `Bearer ${clerkToken}`);
      }
    }

    const res = await fetch(`${apiUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      throw new WardenApiError(res.status, body.error, body.message ?? body.error ?? `Request failed: ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  /** Exchange the Clerk session for an org-scoped token (cached to expiry). */
  async function scopedToken(orgId: string, clerkToken: string): Promise<string> {
    const cached = scopedCache.get(orgId);
    if (cached && cached.expMs - SCOPED_SKEW_MS > Date.now()) return cached.token;

    const res = await fetch(`${apiUrl}/auth/token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${clerkToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      throw new WardenApiError(res.status, body.error, body.message ?? "Token exchange failed");
    }
    const data = (await res.json()) as { token: string; expiresAt: string };
    scopedCache.set(orgId, { token: data.token, expMs: new Date(data.expiresAt).getTime() });
    return data.token;
  }

  function withOrg(path: string, orgId: string): string {
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}orgId=${encodeURIComponent(orgId)}`;
  }

  return {
    getMe(): Promise<MeProfile> {
      return request<MeProfile>("/auth/me");
    },
    retryWallet(): Promise<{ walletAddress: string | null; walletId: string | null; status: string }> {
      return request("/auth/me/wallet", { method: "POST" });
    },
    async listOrgs(): Promise<WardenOrg[]> {
      const res = await request<{ data: WardenOrg[] }>("/auth/orgs");
      return res.data;
    },
    createOrg(name: string): Promise<WardenOrg & { role: string }> {
      return request<WardenOrg & { role: string }>("/auth/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    },
    async pendingInvites(): Promise<PendingInvite[]> {
      const res = await request<{ data: PendingInvite[] }>("/auth/invites/pending");
      return res.data;
    },
    acceptInvite(token: string): Promise<{ organization: WardenOrg; role: string }> {
      return request(`/auth/invites/${encodeURIComponent(token)}/accept`, { method: "POST" });
    },
    listApprovals(orgId: string): Promise<ApprovalsResponse> {
      return request<ApprovalsResponse>(withOrg("/approvals", orgId), {}, orgId);
    },
    approve(orgId: string, requestId: string): Promise<DecisionResult> {
      return request<DecisionResult>(withOrg(`/approvals/${encodeURIComponent(requestId)}/approve`, orgId), { method: "POST" }, orgId);
    },
    reject(orgId: string, requestId: string): Promise<DecisionResult> {
      return request<DecisionResult>(withOrg(`/approvals/${encodeURIComponent(requestId)}/reject`, orgId), { method: "POST" }, orgId);
    },
    approverStatus(orgId: string): Promise<{ rows: unknown[]; outOfSync: number }> {
      return request(`/auth/orgs/${encodeURIComponent(orgId)}/approver-status`, {}, orgId);
    },
    /**
     * Short-lived ticket for the /ws live feed. The connection's feed is
     * scoped to this identity's deployment (org-scoped for Clerk sessions,
     * global for service keys) — see server POST /auth/ws-ticket.
     */
    wsTicket(orgId?: string): Promise<{ ticket: string; expiresAt: string }> {
      return request<{ ticket: string; expiresAt: string }>("/auth/ws-ticket", { method: "POST" }, orgId);
    },
    listAgents(orgId: string): Promise<AgentsResponse> {
      return request<AgentsResponse>(withOrg("/agents?limit=50", orgId), {}, orgId);
    },
    createAgent(input: { orgId: string; label?: string; dailyCap: bigint; perTxCap: bigint; escalationThreshold: bigint }): Promise<{ address: string; label: string | null; dailyCap: string; perTxCap: string; escalationThreshold: string; txHash: string; signer?: string; via?: string; correlationId?: string }> {
      return request("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: input.label,
          dailyCap: input.dailyCap.toString(),
          perTxCap: input.perTxCap.toString(),
          escalationThreshold: input.escalationThreshold.toString(),
        }),
      }, input.orgId);
    },
    getAgent(address: string): Promise<{ agent: AgentView; recentPayments: { data: AuditEvent[]; hasMore: boolean; nextCursor: string | null }; allowlist: AllowlistView[] }> {
      return request(`/agents/${encodeURIComponent(address)}`);
    },
    setPolicy(input: { agent: string; dailyCap: bigint; perTxCap: bigint; escalationThreshold: bigint }): Promise<DecisionResult> {
      return request<DecisionResult>("/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: input.agent, dailyCap: input.dailyCap.toString(), perTxCap: input.perTxCap.toString(), escalationThreshold: input.escalationThreshold.toString() }),
      });
    },
    setAllowlist(input: { agent: string; counterparty: string; allowed: boolean }): Promise<DecisionResult> {
      return request<DecisionResult>("/policies/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    },
    /** Recent payment-lifecycle events (org-scoped audit trail, newest first). */
    listAudit(orgId: string, limit = 15): Promise<AuditEvent[]> {
      return request<{ data: AuditEvent[] }>(withOrg(`/audit?limit=${limit}`, orgId), {}, orgId).then((r) => r.data);
    },
    /** Cursor-paginated audit events for the audit explorer. */
    listAuditPage(orgId: string, opts: { limit?: number; cursor?: string; agent?: string; from?: string; to?: string } = {}): Promise<{ data: AuditEvent[]; hasMore: boolean; nextCursor: string | null }> {
      const params = new URLSearchParams();
      params.set("limit", String(opts.limit ?? 25));
      if (opts.cursor) params.set("cursor", opts.cursor);
      if (opts.agent) params.set("agent", opts.agent);
      if (opts.from) params.set("from", opts.from);
      if (opts.to) params.set("to", opts.to);
      return request(withOrg(`/audit?${params.toString()}`, orgId), {}, orgId);
    },
    /** System status — indexer lag, near-cap agents. */
    getStatus(): Promise<{ ok: boolean; chainHead: string; indexers: Array<{ name: string; lastBlock: string | null; lag: number | null }>; agents: { total: number; nearCap: number; nearCapList: Array<{ address: string; label: string | null; status: string; spentToday: string; activeReserved: string; dailyCap: string; spentPct: number; nearCap: boolean }> } }> {
      return request("/status");
    },
  };
}

export type WardenClient = ReturnType<typeof createWardenClient>;
