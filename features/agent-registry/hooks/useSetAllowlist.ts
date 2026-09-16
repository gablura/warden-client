"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { agentKeys } from "../constants/queryKeys";
import { getApiErrorMessage } from "@/lib/handle-api-error";
import type { SetAllowlistInput } from "../types";

export function useSetAllowlist(orgId: string) {
  const api = useWardenClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: SetAllowlistInput) => api.setAllowlist(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agentKeys.list(orgId) });
    },
    onError: (error) => {
      const msg = getApiErrorMessage(error);
      console.error("[setAllowlist]", msg);
    },
  });
}
