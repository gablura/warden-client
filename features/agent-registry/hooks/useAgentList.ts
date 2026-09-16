"use client";

import { useQuery } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { agentKeys } from "../constants/queryKeys";

export function useAgentList(orgId: string) {
  const api = useWardenClient();
  return useQuery({
    queryKey: agentKeys.list(orgId),
    queryFn: () => api.listAgents(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 30,
  });
}
