"use client";

import { ApprovalCard } from "./approval-card";
import { EmptyState } from "@/components/shared";
import type { ApprovalItem } from "../types";

interface ApprovalQueueProps {
  items: ApprovalItem[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  resolving?: Record<string, "approve" | "reject">;
}

export function ApprovalQueue({ items, onApprove, onReject, resolving }: ApprovalQueueProps) {
  if (items.length === 0) {
    return (
      <EmptyState message="Nothing pending. You're caught up." />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ApprovalCard
          key={item.requestId}
          item={item}
          onApprove={onApprove}
          onReject={onReject}
          resolving={resolving?.[item.requestId]}
        />
      ))}
    </div>
  );
}
