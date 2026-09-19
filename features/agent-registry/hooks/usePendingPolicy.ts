"use client";

import { useQuery } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import type { PendingPolicyView } from "@/lib/warden-api";

export function usePendingPolicy(agentAddress: string) {
  const api = useWardenClient();
  return useQuery({
    queryKey: ["policies", "pending", agentAddress],
    queryFn: () => api.getPendingPolicy(agentAddress).then((r) => r.pending),
    enabled: !!agentAddress,
    staleTime: 1000 * 30,
    refetchInterval: 30000, // Poll every 30s to catch when it becomes ready
  });
}