"use client";

import { useState, useMemo } from "react";
import { useAgentList, useSetPolicy } from "./hooks";

export function useAgentRegistryPage(orgId: string) {
  const { data: response, isLoading, error, refetch } = useAgentList(orgId);
  const setPolicy = useSetPolicy(orgId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"spent" | "cap">("spent");

  const agents = response?.data ?? [];

  const filtered = useMemo(() => {
    let list = agents;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.address.toLowerCase().includes(q) ||
          (a.label ?? "").toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      list = list.filter((a) => a.policyExists);
    } else if (statusFilter === "inactive") {
      list = list.filter((a) => !a.policyExists);
    }

    // Sort by spend (highest first)
    if (sortBy === "spent") {
      list = [...list].sort((a, b) => {
        const sa = BigInt(a.spentToday);
        const sb = BigInt(b.spentToday);
        return sb > sa ? 1 : sb < sa ? -1 : 0;
      });
    }

    return list;
  }, [agents, search, statusFilter, sortBy]);

  return {
    agents: filtered,
    rawAgents: agents,
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    setPolicy,
  };
}
