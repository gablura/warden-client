"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { agentKeys } from "../constants/queryKeys";
import { getApiErrorMessage } from "@/lib/handle-api-error";
import type { SetPolicyInput } from "../types";

export function useSetPolicy(orgId: string) {
  const api = useWardenClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: SetPolicyInput) => api.setPolicy(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: agentKeys.list(orgId) });
      qc.invalidateQueries({ queryKey: agentKeys.detail(variables.agent) });
    },
    onError: (error) => {
      const msg = getApiErrorMessage(error);
      // Caller decides how to surface (toast, inline error, etc.)
      console.error("[setPolicy]", msg);
    },
  });
}
