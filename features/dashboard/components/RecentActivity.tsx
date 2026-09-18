"use client";

import Link from "next/link";
import { formatUsdc, shortenAddress, timeAgo } from "@/lib/format";
import type { AuditEvent } from "@/lib/warden-api";

interface RecentActivityProps {
  events: AuditEvent[];
  maxItems?: number;
}

function decisionBadge(decision: string): { label: string; className: string } {
  if (decision === "approved") {
    return {
      label: "Approved",
      className: "bg-success-subtle text-success",
    };
  }
  if (decision === "escalated") {
    return {
      label: "Escalated",
      className: "bg-warning-subtle text-warning",
    };
  }
  if (decision.startsWith("blocked")) {
    return {
      label: "Blocked",
      className: "bg-danger-subtle text-danger",
    };
  }
  return {
    label: decision,
    className: "bg-surface-raised text-foreground-muted",
  };
}

export function RecentActivity({ events, maxItems = 5 }: RecentActivityProps) {
  const recent = events.slice(0, maxItems);

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-medium text-foreground-secondary">
          Recent Activity
        </span>
        <Link
          href="/dashboard/audit"
          className="text-[10px] font-medium text-foreground-muted transition-colors hover:text-foreground"
        >
          View all →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-foreground-muted">No recent activity</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((event, i) => {
            const badge = decisionBadge(event.decision);
            return (
              <div
                key={`${event.agent}-${event.timestamp}-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-raised"
              >
                {/* Decision dot */}
                <span
                  className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    event.decision === "approved"
                      ? "bg-success"
                      : event.decision === "escalated"
                        ? "bg-warning"
                        : "bg-danger"
                  }`}
                />

                {/* Event details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="data-mono text-foreground">
                      {shortenAddress(event.agent)}
                    </span>
                    <span className="text-foreground-muted">→</span>
                    <span className="data-mono text-foreground">
                      {shortenAddress(event.counterparty)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="data-mono text-[10px] text-foreground-secondary">
                      {formatUsdc(event.amount)}
                    </span>
                    <span
                      className={`inline-flex rounded px-1 py-0.5 text-[9px] font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <span className="flex-shrink-0 text-[10px] text-foreground-muted">
                  {timeAgo(event.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
