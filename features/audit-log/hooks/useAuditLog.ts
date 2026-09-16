"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { auditKeys } from "../constants/queryKeys";
import type { AuditEvent, AuditPageResponse } from "../types";

interface UseAuditLogOpts {
  orgId: string;
  agent?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export function useAuditLog({ orgId, agent, from, to, limit = 25 }: UseAuditLogOpts) {
  const api = useWardenClient();

  return useInfiniteQuery({
    queryKey: [...auditKeys.pages(orgId), { agent, from, to }],
    queryFn: async ({ pageParam }): Promise<AuditPageResponse> => {
      const opts: Parameters<typeof api.listAuditPage>[1] = { limit };
      if (pageParam) opts.cursor = pageParam as string;
      if (agent) opts.agent = agent;
      if (from) opts.from = from;
      if (to) opts.to = to;
      return api.listAuditPage(orgId, opts);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!orgId,
    staleTime: 1000 * 30,
  });
}

/** Flatten infinite query pages into a single array of events. */
export function flattenAuditEvents(pages: { data: AuditEvent[] }[]): AuditEvent[] {
  return pages.flatMap((p) => p.data);
}
