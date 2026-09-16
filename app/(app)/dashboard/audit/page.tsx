"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { FilterBar, EmptyState, LoadMoreButton } from "@/components/shared";
import { useAuditLog, flattenAuditEvents, AuditRow } from "@/features/audit-log";

export default function AuditPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const api = useWardenClient();
  const router = useRouter();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<Set<string>>(
    () => new Set(["approved", "escalated", "blocked"])
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/sign-in");
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || authLoading || orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await api.getMe();
        if (cancelled) return;
        const first = me.memberships[0]?.org;
        if (first) setOrgId(first.id);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, authLoading, orgId, api]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAuditLog({
    orgId: orgId ?? "",
    agent: search || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const events = useMemo(() => (data ? flattenAuditEvents(data.pages) : []), [data]);

  // Apply decision filter client-side (backend doesn't filter by decision type)
  const filteredEvents = useMemo(() => {
    if (decisionFilter.size === 0) return events;
    return events.filter((e) => {
      if (decisionFilter.has("approved") && e.decision === "approved") return true;
      if (decisionFilter.has("escalated") && e.decision === "escalated") return true;
      if (decisionFilter.has("blocked") && e.decision.startsWith("blocked")) return true;
      return false;
    });
  }, [events, decisionFilter]);

  const toggleDecision = useCallback((d: string) => {
    setDecisionFilter((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setDecisionFilter(new Set(["approved", "escalated", "blocked"]));
    setFrom("");
    setTo("");
  }, []);

  const hasActiveFilters = search || from || to || decisionFilter.size < 3;

  if (authLoading || !orgId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-foreground-muted">Loading audit log...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Audit Log</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            View immutable event history
          </p>
        </div>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/audit/export`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost h-9 px-3 text-xs"
        >
          Export CSV
        </a>
      </div>

      <FilterBar
        searchPlaceholder="Filter by agent address..."
        searchValue={search}
        onSearchChange={setSearch}
        chips={[
          { key: "approved", label: "Approved", selected: decisionFilter.has("approved"), onClick: () => toggleDecision("approved") },
          { key: "escalated", label: "Escalated", selected: decisionFilter.has("escalated"), onClick: () => toggleDecision("escalated") },
          { key: "blocked", label: "Blocked", selected: decisionFilter.has("blocked"), onClick: () => toggleDecision("blocked") },
        ]}
      >
        <div className="flex gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input h-9 text-xs"
            title="From date"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input h-9 text-xs"
            title="To date"
          />
        </div>
      </FilterBar>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs text-foreground-muted hover:text-foreground"
        >
          Clear all filters
        </button>
      )}

      {isLoading ? (
        <div className="surface p-8 text-center">
          <div className="text-sm text-foreground-muted">Loading events...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          message={hasActiveFilters ? "No activity in this range." : "No activity yet."}
          action={
            hasActiveFilters ? (
              <button type="button" onClick={clearFilters} className="btn btn-ghost text-xs">
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground-secondary">Timestamp</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground-secondary">Agent</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground-secondary">Counterparty</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground-secondary">Amount</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground-secondary">Decision</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground-secondary">Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEvents.map((event) => (
                  <AuditRow key={event.id} event={event} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards - handled inside AuditRow */}

          <LoadMoreButton
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            hasMore={hasNextPage}
          />
        </div>
      )}
    </div>
  );
}
