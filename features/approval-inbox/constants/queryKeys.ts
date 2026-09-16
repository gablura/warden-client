export const approvalKeys = {
  all: ["approvals"] as const,
  queue: () => [...approvalKeys.all, "queue"] as const,
} as const;
