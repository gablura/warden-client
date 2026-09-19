"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { agentKeys } from "../constants/queryKeys";
import { getApiErrorMessage } from "@/lib/handle-api-error";
import { toast } from "@/features/toast/ToastProvider";
import type { SetAllowlistInput } from "../types";

export function useSetAllowlist(orgId: string) {
  const api = useWardenClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: SetAllowlistInput) => api.setAllowlist(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: agentKeys.list(orgId) });
      // The passport renders the allowlist from the detail query — refresh
      // it too, or a toggle would appear to do nothing until a manual reload.
      qc.invalidateQueries({ queryKey: agentKeys.detail(variables.agent) });
      toast.success("Allowlist updated", {
        description: `${variables.allowed ? "Allowed" : "Blocked"} ${variables.counterparty.slice(0, 6)}…${variables.counterparty.slice(-4)} for agent ${variables.agent.slice(0, 6)}…${variables.agent.slice(-4)}.`,
      });
    },
    onError: (error) => {
      const msg = getApiErrorMessage(error);
      toast.error("Allowlist update failed", { description: msg });
    },
  });
}
