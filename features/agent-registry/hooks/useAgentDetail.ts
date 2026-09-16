"use client";

import { useQuery } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { agentKeys } from "../constants/queryKeys";

export function useAgentDetail(address: string) {
  const api = useWardenClient();
  return useQuery({
    queryKey: agentKeys.detail(address),
    queryFn: () => api.getAgent(address),
    enabled: !!address,
    staleTime: 1000 * 15,
  });
}
