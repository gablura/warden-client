export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (orgId: string) => [...agentKeys.lists(), orgId] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (address: string) => [...agentKeys.details(), address] as const,
} as const;
