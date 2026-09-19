"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { agentKeys } from "../constants/queryKeys";
import { getApiErrorMessage } from "@/lib/handle-api-error";

export function useApplyPendingPolicy(orgId: string) {
  const api = useWardenClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (agent: string) => api.applyPendingPolicy({ agent }),
    onSuccess: (_, agent) => {
      qc.invalidateQueries({ queryKey: agentKeys.list(orgId) });
      qc.invalidateQueries({ queryKey: agentKeys.detail(agent) });
      qc.invalidateQueries({ queryKey: ["policies", "pending", agent] });
    },
    onError: (error) => {
      const msg = getApiErrorMessage(error);
      console.error("[applyPendingPolicy]", msg);
    },
  });
}