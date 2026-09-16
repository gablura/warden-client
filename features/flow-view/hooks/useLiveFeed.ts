"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentSummary, FeedEvent, LiveMessage } from "../types";

interface LiveFeedState {
  agents: AgentSummary[];
  events: FeedEvent[];
  pendingCount: number;
}

const MAX_EVENTS = 15;
const RECONNECT_DELAY_MS = 2000;

function applyLiveMessage(prev: LiveFeedState, message: LiveMessage): LiveFeedState {
  switch (message.type) {
    case "payment_approved":
    case "payment_blocked":
    case "payment_escalated": {
      const decision =
        message.type === "payment_approved"
          ? "approved"
          : message.type === "payment_blocked"
            ? `blocked: ${message.reason ?? "policy violation"}`
            : "escalated";

      const newEvent: FeedEvent = {
        agent: message.agent ?? "",
        counterparty: message.counterparty ?? "",
        amount: message.amount ?? "0",
        decision,
        timestamp: new Date().toISOString(),
      };

      const agents =
        message.type === "payment_approved"
          ? prev.agents.map((agent) =>
              agent.address === message.agent
                ? { ...agent, spentToday: (BigInt(agent.spentToday || "0") + BigInt(message.amount ?? 0)).toString() }
                : agent
            )
          : prev.agents;

      return {
        agents,
        events: [newEvent, ...prev.events].slice(0, MAX_EVENTS),
        pendingCount: message.type === "payment_escalated" ? prev.pendingCount + 1 : prev.pendingCount,
      };
    }
    case "approval_resolved":
      return { ...prev, pendingCount: Math.max(prev.pendingCount - 1, 0) };
    default:
      return prev;
  }
}

/**
 * Seeds from server-rendered props, then layers live WebSocket updates on top.
 *
 * The /ws hub is deployment-scoped: the feed is authenticated with a
 * short-lived ticket from POST /auth/ws-ticket (browsers cannot send custom
 * headers on a WebSocket upgrade), and the server scopes the connection to
 * this identity's deployment for life — the same scoping as the REST calls.
 * A fresh ticket is fetched on every connect, because reconnects happen
 * after the previous ticket/connection is long gone.
 */
export function useLiveFeed(initial: LiveFeedState): LiveFeedState {
  const [state, setState] = useState(initial);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const wsBase = `${apiUrl.replace(/^http/, "ws")}/ws`;
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      (async () => {
        let url = wsBase;
        try {
          // Fetch ticket from the API — requires auth headers from the session.
          const res = await fetch(`${apiUrl}/auth/ws-ticket`, { credentials: "include" });
          if (res.ok) {
            const { ticket } = await res.json();
            if (cancelled) return;
            url = `${wsBase}?ticket=${encodeURIComponent(ticket)}`;
          }
        } catch {
          // No ticket available (signed out, or the server is unreachable).
          // Still attempt the connection: on testnet it succeeds anonymously;
          // on mainnet the server closes it and the reconnect loop retries
          // with a fresh ticket.
        }
        if (cancelled) return;

        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
          socket.send(JSON.stringify({ type: "subscribe", agents: ["*"] }));
        };

        socket.onmessage = (event) => {
          const message: LiveMessage = JSON.parse(event.data);
          setState((prev) => applyLiveMessage(prev, message));
        };

        socket.onclose = () => {
          if (!cancelled) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        };
      })();
    }

    connect();
    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, []);

  return state;
}
