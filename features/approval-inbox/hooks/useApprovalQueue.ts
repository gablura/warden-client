"use client";

import { useQuery } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { approvalKeys } from "../constants/queryKeys";

export function useApprovalQueue(orgId: string) {
  const api = useWardenClient();
  return useQuery({
    queryKey: approvalKeys.queue(),
    queryFn: () => api.listApprovals(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 10,
  });
}
