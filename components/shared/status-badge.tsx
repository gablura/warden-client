import { cn } from "@/lib/utils";

type Status = "approved" | "escalated" | "blocked" | "neutral" | "treasury";

const STATUS_ICONS: Record<Status, string> = {
  approved: "✓",
  escalated: "↑",
  blocked: "✕",
  neutral: "•",
  treasury: "◆",
};

const STATUS_LABELS: Record<Status, string> = {
  approved: "Approved",
  escalated: "Escalated",
  blocked: "Blocked",
  neutral: "Neutral",
  treasury: "Treasury",
};

function resolveStatus(decision: string): Status {
  if (decision === "approved") return "approved";
  if (decision === "escalated") return "escalated";
  if (decision.startsWith("blocked")) return "blocked";
  return "neutral";
}

interface StatusBadgeProps {
  status?: Status;
  decision?: string;
  className?: string;
  /** Only render icon+color, no label text */
  iconOnly?: boolean;
}

export function StatusBadge({ status, decision, className, iconOnly }: StatusBadgeProps) {
  const resolved = status ?? (decision ? resolveStatus(decision) : "neutral");

  return (
    <span
      className={cn("status-badge", className)}
      data-status={resolved}
      title={STATUS_LABELS[resolved]}
    >
      <span aria-hidden="true">{STATUS_ICONS[resolved]}</span>
      {!iconOnly && (
        <span>{decision && !status ? decision : STATUS_LABELS[resolved]}</span>
      )}
    </span>
  );
}
