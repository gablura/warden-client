"use client";

import { StatusBadge } from "@/components/shared";

interface AgentIdentityHeaderProps {
  agent: { address: string; label: string | null; policyExists?: boolean };
}

export function AgentIdentityHeader({ agent }: AgentIdentityHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {agent.label ?? "Agent"}
        </h2>
        <StatusBadge status={agent.policyExists ? "approved" : "neutral"} />
      </div>
      <div className="data-mono flex items-center gap-2 text-xs text-foreground-muted">
        <span className="select-all">{agent.address}</span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(agent.address)}
          className="text-foreground-muted hover:text-foreground"
          title="Copy address"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="5" width="8" height="8" rx="1" />
            <path d="M3 11V3h8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
