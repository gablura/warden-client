"use client";

import { DataTable, EmptyState, RoleGate, SpendBar } from "@/components/shared";
import type { Column } from "@/components/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** Shape both AgentView (list API) and AgentRecord (detail API) satisfy. */
interface AgentRowData {
  address: string;
  label: string | null;
  dailyCap: string;
  perTxCap: string;
  spentToday: string;
  status: string;
  nearCap?: boolean;
  policyExists?: boolean;
  lastActivityAt?: string | null;
}

const columns: Column<AgentRowData>[] = [
  {
    key: "agent",
    header: "Agent",
    className: "min-w-0 flex-1",
    render: (a) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {a.label ?? "Agent"}
        </div>
        <div className="data-mono mt-0.5 truncate text-xs text-foreground-muted">
          {a.address.length > 13 ? `${a.address.slice(0, 6)}…${a.address.slice(-4)}` : a.address}
        </div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (a) => (a.policyExists ? "Active" : "No policy"),
  },
  {
    key: "spent",
    header: "Spent / Cap",
    className: "w-40",
    render: (a) => (
      <div className="space-y-1">
        <SpendBar spent={BigInt(a.spentToday || "0")} cap={BigInt(a.dailyCap || "0")} />
        <div className="data-mono text-[10px] text-foreground-muted">
          {formatSimple(a.spentToday)} / {formatSimple(a.dailyCap)}
        </div>
      </div>
    ),
  },
  {
    key: "perTxCap",
    header: "Per-tx cap",
    className: "w-28",
    render: (a) => (
      <span className="data-mono text-xs">{formatSimple(a.perTxCap)}</span>
    ),
  },
  {
    key: "lastActivity",
    header: "Last activity",
    className: "w-32",
    render: (a) => (
      <span className="text-xs text-foreground-muted">
        {a.lastActivityAt ? new Date(a.lastActivityAt).toLocaleString() : "—"}
      </span>
    ),
  },
];

function formatSimple(raw: string): string {
  try {
    const v = BigInt(raw || "0");
    const dollars = Number(v) / 1_000_000;
    return `$${dollars.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  } catch {
    return raw;
  }
}

interface AgentTableProps {
  agents: AgentRowData[];
}

export function AgentTable({ agents }: AgentTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={agents}
      keyExtractor={(a) => a.address}
      onRowClick={(agent) => router.push(`/dashboard/agents/${agent.address}`)}
      emptyState={
        <EmptyState
          message="No agents registered yet."
          action={
            <RoleGate minRole="admin">
              <Link href="/dashboard/agents" className="btn btn-primary text-xs">
                Register an agent
              </Link>
            </RoleGate>
          }
        />
      }
    />
  );
}
