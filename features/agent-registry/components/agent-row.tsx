"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { shortenAddress, formatUsdc } from "@/lib/format";
import { StatusBadge, SpendBar } from "@/components/shared";
import type { AgentRecord } from "../types";

function AgentRowInner({ agent }: { agent: AgentRecord }) {
  const router = useRouter();

  return (
    <div
      className="cursor-pointer transition-colors hover:bg-surface-raised"
      onClick={() => router.push(`/dashboard/agents/${agent.address}`)}
    >
      {/* Desktop */}
      <div className="hidden items-center gap-4 px-3 py-2.5 sm:flex">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {agent.label ?? shortenAddress(agent.address)}
          </div>
          <div className="data-mono mt-0.5 truncate text-xs text-foreground-muted">
            {shortenAddress(agent.address)}
          </div>
        </div>
        <StatusBadge status={agent.policyExists ? "approved" : "neutral"} />
        <SpendBar spent={BigInt(agent.spentToday)} cap={BigInt(agent.dailyCap)} />
        <span className="data-mono w-24 text-right text-xs text-foreground-secondary">
          {formatUsdc(agent.perTxCap)}
        </span>
      </div>

      {/* Mobile card */}
      <div className="surface space-y-2 p-3 sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {agent.label ?? "Agent"}
            </div>
            <div className="data-mono mt-0.5 truncate text-xs text-foreground-muted">
              {shortenAddress(agent.address)}
            </div>
          </div>
          <StatusBadge status={agent.policyExists ? "approved" : "neutral"} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground-muted">Spent today</span>
          <span className="data-mono text-foreground-secondary">
            {formatUsdc(agent.spentToday)} / {formatUsdc(agent.dailyCap)}
          </span>
        </div>
        <SpendBar spent={BigInt(agent.spentToday)} cap={BigInt(agent.dailyCap)} />
      </div>
    </div>
  );
}

export const AgentRow = memo(AgentRowInner);
