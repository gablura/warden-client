"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { agentKeys } from "../constants/queryKeys";
import { getApiErrorMessage } from "@/lib/handle-api-error";
import { toast } from "@/features/toast/ToastProvider";
import type { SetPolicyInput } from "../types";

export function useSetPolicy(orgId: string) {
  const api = useWardenClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: SetPolicyInput) => api.setPolicy(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: agentKeys.list(orgId) });
      qc.invalidateQueries({ queryKey: agentKeys.detail(variables.agent) });
      // Force immediate refetch of pending policy so the "scheduled increase" badge appears instantly
      qc.refetchQueries({ queryKey: ["policies", "pending", variables.agent] });
      toast.success("Policy updated", {
        description: `Agent ${variables.agent.slice(0, 6)}…${variables.agent.slice(-4)} policy confirmed on-chain.`,
      });
    },
    onError: (error) => {
      const msg = getApiErrorMessage(error);
      toast.error("Policy update failed", { description: msg });
    },
  });
}
