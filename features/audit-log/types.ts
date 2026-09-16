import type { AuditEvent as WardenAuditEvent } from "@/lib/warden-api";

export type AuditEvent = WardenAuditEvent;

export interface AuditPageResponse {
  data: AuditEvent[];
  hasMore: boolean;
  nextCursor: string | null;
}
