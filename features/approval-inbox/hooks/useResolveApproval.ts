"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { approvalKeys } from "../constants/queryKeys";
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
      await qc.cancelQueries({ queryKey: approvalKeys.queue() });
      const previous = qc.getQueryData(approvalKeys.queue());
      qc.setQueryData(approvalKeys.queue(), (old: { data: ApprovalItem[] } | undefined) => {
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

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(approvalKeys.queue(), context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.queue() });
    },
  });
}
