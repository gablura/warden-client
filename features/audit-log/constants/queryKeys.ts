export const auditKeys = {
  all: ["audit"] as const,
  pages: (orgId: string) => [...auditKeys.all, "pages", orgId] as const,
} as const;
