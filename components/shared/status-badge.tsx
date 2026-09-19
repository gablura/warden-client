import { cn } from "@/lib/utils";

type Status = "approved" | "escalated" | "blocked" | "expired" | "neutral" | "treasury";

const STATUS_ICONS: Record<Status, string> = {
  approved: "✓",
  escalated: "↑",
  blocked: "✕",
  // An expired request was never decided by a human — its reservation
  // window lapsed (see indexer/expirePendingRequests.ts). A clock reads
  // differently from the "×" of a deliberate block, which matters in the
  // audit trail.
  expired: "⏱",
  neutral: "•",
  treasury: "◆",
};

const STATUS_LABELS: Record<Status, string> = {
  approved: "Approved",
  escalated: "Escalated",
  blocked: "Blocked",
  expired: "Expired",
  neutral: "Neutral",
  treasury: "Treasury",
};

function resolveStatus(decision: string): Status {
  if (decision === "approved") return "approved";
  if (decision === "escalated") return "escalated";
  if (decision.startsWith("blocked")) return "blocked";
  // Stored as "expired — no approver action within window" so the reason
  // travels with the row; only the prefix is structural.
  if (decision.startsWith("expired")) return "expired";
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
