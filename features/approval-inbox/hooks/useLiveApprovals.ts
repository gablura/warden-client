"use client";

import { useEffect, useState } from "react";
import { useWardenClient } from "@/features/auth/useWardenClient";
import type { ApprovalItem, ApprovalsResponse } from "../types";

const RECONNECT_DELAY_MS = 2000;

/**
 * Seeds from a server-fetched `GET /approvals` list, then layers live
 * WebSocket updates on top — the same shape as the flow view's
 * `useLiveFeed` (server data first, live events layered, reconnect with a
 * fresh ticket).
 *
 * Applies two live event kinds to the seeded list:
 * - `payment_escalated` — a new pending card is prepended (the same event
 *   the flow ticker consumes; the queue has no reason to re-poll for it).
 * - `approval_resolved` — approved/rejected/expired rows drop off the
 *   queue immediately, instead of at the next 10s staleTime refetch.
 *
 * The connection itself is deployment-scoped and ticket-authenticated —
 * see useLiveFeed for the full rationale; this hook reuses the identical
 * ticket → `/ws?ticket=...` connect/reconnect loop.
 */
export function useLiveApprovals(initial: ApprovalsResponse | undefined): ApprovalsResponse | undefined {
  const [state, setState] = useState<ApprovalsResponse | undefined>(initial);
  const [lastServer, setLastServer] = useState<ApprovalsResponse | undefined>(initial);
  const api = useWardenClient();

  // Fresh server data (first load, refetch, post-mutation invalidate) wins
  // over whatever live additions were layered on the previous seed. Applied
  // during render — React's documented "adjust state when a prop changes"
  // pattern — rather than in an effect, which would cause a cascading
  // re-render and trip react-hooks/set-state-in-effect.
  if (initial !== lastServer) {
    setLastServer(initial);
    setState(initial);
  }

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
          const { ticket } = await api.wsTicket();
          if (cancelled) return;
          url = `${wsBase}?ticket=${encodeURIComponent(ticket)}`;
        } catch {
          // No ticket (signed out / server unreachable) — still attempt the
          // anonymous testnet connection; mainnet closes it and we retry.
        }
        if (cancelled) return;

        const socket = new WebSocket(url);

        socket.onopen = () => {
          socket.send(JSON.stringify({ type: "subscribe", agents: ["*"] }));
        };

        socket.onmessage = (event) => {
          const message: {
            type: string;
            requestId?: string;
            agent?: string;
            counterparty?: string;
            amount?: string;
          } = JSON.parse(event.data);

          if (message.type === "payment_escalated" && message.requestId) {
            setState((prev) => {
              if (!prev) return prev;
              // Already queued (seed arrived after the broadcast) — skip.
              if (prev.data.some((item) => item.requestId === message.requestId)) return prev;
              const item: ApprovalItem = {
                requestId: message.requestId!,
                agent: message.agent ?? "",
                counterparty: message.counterparty ?? "",
                amount: message.amount ?? "0",
                resolved: false,
                createdAt: new Date().toISOString(),
                // Policy fields arrive with the next refetch; the card
                // renders "cannot verify cap" until then, which is honest.
              };
              return { ...prev, data: [item, ...prev.data] };
            });
          } else if (message.type === "approval_resolved" && message.requestId) {
            setState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                data: prev.data.filter((item) => item.requestId !== message.requestId),
              };
            });
          }
          // spend_reserved / spend_reservation_released / payment_* don't
          // change the queue shape — the cap-fit readouts refresh from the
          // next chain-backed refetch.
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
    };
  }, [api]);

  return state;
}
