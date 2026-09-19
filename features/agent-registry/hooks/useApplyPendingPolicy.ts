"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { agentKeys } from "../constants/queryKeys";
import { getApiErrorMessage } from "@/lib/handle-api-error";
import { toast } from "@/features/toast/ToastProvider";

export function useApplyPendingPolicy(orgId: string) {
  const api = useWardenClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (agent: string) => api.applyPendingPolicy({ agent }),
    onSuccess: (_data, agent: string) => {
      qc.invalidateQueries({ queryKey: agentKeys.list(orgId) });
      qc.invalidateQueries({ queryKey: agentKeys.detail(agent) });
      qc.invalidateQueries({ queryKey: ["policies", "pending", agent] });
      toast.success("Scheduled increase applied", {
        description: `Agent ${agent.slice(0, 6)}…${agent.slice(-4)} cap increase is now active.`,
      });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error);
      toast.error("Apply failed", { description: msg });
    },
  });
}