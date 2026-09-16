"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { FilterBar } from "@/components/shared";
import { AgentTable } from "@/features/agent-registry/components/agent-table";
import { useAgentRegistryPage } from "@/features/agent-registry";

export default function AgentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const api = useWardenClient();
  const router = useRouter();

  // Resolve org from profile
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || authLoading || orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await api.getMe();
        if (cancelled) return;
        const first = me.memberships[0]?.org;
        if (first) setOrgId(first.id);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, authLoading, orgId, api]);

  const {
    agents,
    isLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
  } = useAgentRegistryPage(orgId ?? "");

  if (authLoading || !orgId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-foreground-muted">Loading agents...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Agents</h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Manage registered agent addresses and policies
        </p>
      </div>

      <FilterBar
        searchPlaceholder="Search agents..."
        searchValue={search}
        onSearchChange={setSearch}
        chips={[
          {
            key: "all",
            label: "All",
            selected: statusFilter === "all",
            onClick: () => setStatusFilter("all"),
          },
          {
            key: "active",
            label: "Active",
            selected: statusFilter === "active",
            onClick: () => setStatusFilter("active"),
          },
          {
            key: "inactive",
            label: "Inactive",
            selected: statusFilter === "inactive",
            onClick: () => setStatusFilter("inactive"),
          },
        ]}
      />

      {isLoading ? (
        <div className="surface p-8 text-center">
          <div className="text-sm text-foreground-muted">Loading agents...</div>
        </div>
      ) : (
        <AgentTable agents={agents} />
      )}
    </div>
  );
}
