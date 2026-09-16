"use client";

import { DataTable, EmptyState } from "@/components/shared";
import type { Column } from "@/components/shared";
import { RoleGate } from "@/components/shared";
import Link from "next/link";

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
    render: (a) => a.policyExists ? "Active" : "No policy",
  },
  {
    key: "spent",
    header: "Spent / Cap",
    className: "w-40",
    render: (a) => (
      <span className="data-mono text-xs">
        {formatSimple(a.spentToday)} / {formatSimple(a.dailyCap)}
      </span>
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
  return (
    <DataTable
      columns={columns}
      data={agents}
      keyExtractor={(a) => a.address}
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
