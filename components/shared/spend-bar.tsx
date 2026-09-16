import { cn } from "@/lib/utils";

interface SpendBarProps {
  spent: bigint;
  cap: bigint;
  className?: string;
}

function tone(spentPct: number): "success" | "warning" | "danger" {
  if (spentPct >= 80) return "danger";
  if (spentPct >= 50) return "warning";
  return "success";
}

const TONE_COLORS = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function SpendBar({ spent, cap, className }: SpendBarProps) {
  const pct = cap > BigInt(0) ? Number((spent * BigInt(100)) / cap) : 0;
  const clamped = Math.min(pct, 100);
  const t = tone(pct);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all", TONE_COLORS[t])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="data-mono text-xs text-foreground-muted">
        {pct}%
      </span>
    </div>
  );
}
