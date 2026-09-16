import type { AgentSummary, FeedEvent } from "./types";
import type { Session } from "@/lib/auth/session";

// Server-only — never import BACKEND_URL from a 'use client' file.
// The browser talks to NEXT_PUBLIC_API_URL instead (see useLiveFeed.ts).
const BACKEND_URL = process.env.BACKEND_URL;

export interface FlowViewData {
  agents: AgentSummary[];
  recentEvents: FeedEvent[];
  pendingCount: number;
}

const TICKER_LIMIT = 15;
const NODE_LIMIT = 4;

/**
 * Fetches everything the dashboard needs, scoped to the caller's
 * organization. Each request is ISR-cached for 15s with a tag, so a
 * burst of concurrent page loads shares one upstream request instead
 * of hammering warden-server — the WebSocket layer on top keeps the
 * page feeling live between revalidations, so 15s of staleness on
 * first paint is a non-issue.
 *
 * NOTE: warden-server's /agents, /audit, and /approvals routes don't
 * yet accept an organizationId filter — they return everything. This
 * function is already shaped for org-scoping (and sends the header
 * below in anticipation), but until the backend adds Organization/
 * Membership to its schema and filters by it, this will show every
 * org's data, not just the caller's. Don't treat this as actually
 * multi-tenant-safe until that backend change lands.
 */
export async function getFlowViewData(session: Session): Promise<FlowViewData> {
  const headers = { "x-organization-id": session.organizationId };

  const [agentsRes, eventsRes, approvalsRes] = await Promise.all([
    fetch(`${BACKEND_URL}/agents`, { headers, next: { revalidate: 15, tags: ["agents"] } }),
    fetch(`${BACKEND_URL}/audit`, { headers, next: { revalidate: 15, tags: ["audit"] } }),
    fetch(`${BACKEND_URL}/approvals`, { headers, next: { revalidate: 15, tags: ["approvals"] } }),
  ]);

  if (!agentsRes.ok || !eventsRes.ok || !approvalsRes.ok) {
    throw new Error("Failed to load dashboard data from warden-server");
  }

  const [agents, events, pending]: [AgentSummary[], FeedEvent[], unknown[]] = await Promise.all([
    agentsRes.json(),
    eventsRes.json(),
    approvalsRes.json(),
  ]);

  return {
    agents: agents.slice(0, NODE_LIMIT),
    recentEvents: events.slice(0, TICKER_LIMIT),
    pendingCount: pending.length,
  };
}
