import { formatUsdc, shortenAddress } from "@/lib/format";
import type { FeedEvent } from "../types";

interface EventTickerProps {
  events: FeedEvent[];
}

function decisionStyle(decision: string): { color: string; label: string } {
  if (decision === "approved") return { color: "var(--color-success)", label: "APPROVED" };
  if (decision === "escalated") return { color: "var(--color-warning)", label: "ESCALATED" };
  if (decision.startsWith("blocked")) return { color: "var(--color-danger)", label: "BLOCKED" };
  return { color: "var(--color-foreground-muted)", label: decision };
}

function TickerItem({ event }: { event: FeedEvent }) {
  const style = decisionStyle(event.decision);
  const target = event.decision === "escalated" ? "gate" : shortenAddress(event.counterparty);

  return (
    <span className="inline-flex items-center gap-2 pr-6">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
      />
      <span className="data-mono text-foreground">{shortenAddress(event.agent)}</span>
      <span className="text-foreground-muted">→</span>
      <span className="data-mono text-foreground">{target}</span>
      <span className="data-mono font-medium text-foreground">{formatUsdc(event.amount)}</span>
      <span
        className="rounded px-1 py-0.5 text-[9px] font-semibold"
        style={{ backgroundColor: `${style.color}18`, color: style.color }}
      >
        {style.label}
      </span>
    </span>
  );
}

export function EventTicker({ events }: EventTickerProps) {
  const line =
    events.length > 0
      ? events.map((e) => <TickerItem key={`${e.agent}-${e.timestamp}`} event={e} />).reduce(
          (acc, item, i) => (
            <>
              {acc}
              {i > 0 && <span className="mx-3 text-foreground-muted">|</span>}
              {item}
            </>
          ),
          <></>,
        )
      : (
          <span className="text-foreground-muted">
            Waiting for the first payment on this feed
          </span>
        );

  return (
    <div className="surface overflow-hidden border-b-2 border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-success" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
          Live Event Feed
        </span>
      </div>
      <div className="overflow-hidden whitespace-nowrap">
        <div className="ticker-track data-mono text-xs">
          <span className="pr-6">{line}</span>
          <span className="pr-6" aria-hidden="true">{line}</span>
        </div>
      </div>
    </div>
  );
}
