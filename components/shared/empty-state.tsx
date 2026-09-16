import type { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="surface flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-sm text-foreground-secondary">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
