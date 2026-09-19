"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { approvalKeys } from "../constants/queryKeys";
import { getApiErrorMessage } from "@/lib/handle-api-error";
import { toast } from "@/features/toast/ToastProvider";
import type { ApprovalItem } from "../types";

export function useResolveApproval(orgId: string) {
  const api = useWardenClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: { requestId: string; decision: "approve" | "reject" }) =>
      input.decision === "approve"
        ? api.approve(orgId, input.requestId)
        : api.reject(orgId, input.requestId),

    onMutate: async ({ requestId, decision }) => {
      await qc.cancelQueries({ queryKey: approvalKeys.queue(orgId) });
      const previous = qc.getQueryData(approvalKeys.queue(orgId));
      qc.setQueryData(approvalKeys.queue(orgId), (old: { data: ApprovalItem[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((a) =>
            a.requestId === requestId ? { ...a, _resolving: decision } : a
          ),
        };
      });
      return { previous };
    },

    onError: (error, vars, context) => {
      if (context?.previous) {
        qc.setQueryData(approvalKeys.queue(orgId), context.previous);
      }
      const msg = getApiErrorMessage(error);
      toast.error(`${vars.decision === "approve" ? "Approve" : "Reject"} failed`, { description: msg });
    },

    onSuccess: (_data, vars) => {
      toast.success(vars.decision === "approve" ? "Approved" : "Rejected", {
        description: `Request ${vars.requestId.slice(0, 8)}… ${vars.decision}d on-chain.`,
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.queue(orgId) });
    },
  });
}
