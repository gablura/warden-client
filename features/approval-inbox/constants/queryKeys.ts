export const approvalKeys = {
  all: ["approvals"] as const,
  /// Per-org queue key. The org id MUST be part of the key: switching orgs
  /// must not read another org's cached queue.
  queue: (orgId: string) => [...approvalKeys.all, "queue", orgId] as const,
} as const;
