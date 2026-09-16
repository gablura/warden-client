"use client";

import { memo, useState } from "react";
import { formatUsdc, shortenAddress } from "@/lib/format";
import { StatusBadge } from "@/components/shared";
import type { AuditEvent } from "../types";

function AuditRowInner({ event }: { event: AuditEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Desktop row */}
      <tr
        className="cursor-pointer transition-colors hover:bg-surface-raised"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-3 py-2.5 text-xs text-foreground-muted">
          {new Date(event.timestamp).toLocaleString()}
        </td>
        <td className="px-3 py-2.5">
          <span className="data-mono text-xs">{shortenAddress(event.agent)}</span>
        </td>
        <td className="px-3 py-2.5">
          <span className="data-mono text-xs">{shortenAddress(event.counterparty)}</span>
        </td>
        <td className="px-3 py-2.5">
          <span className="data-mono text-xs">{formatUsdc(event.amount)}</span>
        </td>
        <td className="px-3 py-2.5">
          <StatusBadge decision={event.decision} />
        </td>
        <td className="px-3 py-2.5">
          {event.txHash && (
            <span className="data-mono text-xs text-foreground-muted">
              {shortenAddress(event.txHash)}
            </span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="border-b border-border bg-surface-raised px-6 py-3">
            <div className="space-y-1 text-xs">
              <div className="flex gap-4">
                <span className="text-foreground-muted">Full decision:</span>
                <span className="text-foreground">{event.decision}</span>
              </div>
              {event.txHash && (
                <div className="flex gap-4">
                  <span className="text-foreground-muted">Tx hash:</span>
                  <span className="data-mono select-all text-foreground">{event.txHash}</span>
                </div>
              )}
              <div className="flex gap-4">
                <span className="text-foreground-muted">Timestamp:</span>
                <span className="text-foreground">{new Date(event.timestamp).toISOString()}</span>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Mobile card */}
      <tr className="sm:hidden">
        <td colSpan={6} className="p-0">
          <div
            className="cursor-pointer border-b border-border p-3 active:bg-surface-raised"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="data-mono text-sm font-medium text-foreground">
                  {formatUsdc(event.amount)}
                </div>
                <div className="data-mono mt-0.5 text-xs text-foreground-muted">
                  {shortenAddress(event.agent)} → {shortenAddress(event.counterparty)}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge decision={event.decision} />
                <span className="text-xs text-foreground-muted">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            {expanded && (
              <div className="mt-2 space-y-1 border-t border-border pt-2 text-xs">
                <div>
                  <span className="text-foreground-muted">Full decision: </span>
                  <span className="text-foreground">{event.decision}</span>
                </div>
                {event.txHash && (
                  <div>
                    <span className="text-foreground-muted">Tx: </span>
                    <span className="data-mono select-all text-foreground">{event.txHash}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

export const AuditRow = memo(AuditRowInner);
