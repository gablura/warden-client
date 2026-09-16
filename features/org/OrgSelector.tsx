"use client";

import { useEffect, useState } from "react";
import { useWardenClient } from "@/features/auth/useWardenClient";
import type { PendingInvite, WardenOrg } from "@/lib/warden-api";

type View = "loading" | "select" | "create" | "join";

/**
 * First-login onboarding (§4): no org membership → choose to create a new
 * organization (become Owner) or join via an invite (invited role, Viewer
 * by default). Single-org accounts skip straight through.
 */
export function OrgSelector({ onComplete }: { onComplete: (org: WardenOrg) => void }) {
  const api = useWardenClient();
  const [view, setView] = useState<View>("loading");
  const [orgs, setOrgs] = useState<WardenOrg[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [name, setName] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, pending] = await Promise.all([api.listOrgs(), api.pendingInvites()]);
        if (cancelled) return;
        setOrgs(list);
        setInvites(pending);
        if (pending.length > 0) {
          setView("join");
        } else if (list.length === 1 && list[0]) {
          onComplete(list[0]);
        } else if (list.length > 1) {
          setView("select");
        } else {
          setView("create");
        }
      } catch {
        if (!cancelled) setView("create");
      }
    })();
    return () => { cancelled = true; };
    // api is memo-stable; onComplete is a parent callback — intentionally
    // not a dep (re-running selection on every parent render would loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Organization name is required");
      return;
    }
    setSaving(true);
    try {
      const org = await api.createOrg(trimmed);
      onComplete(org);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setSaving(false);
    }
  };

  /** Accept an invite by token (from the list or pasted from a link). */
  const handleAccept = async (rawToken: string) => {
    // Accept either a bare token or a full invite link.
    const token = rawToken.includes("/") ? (rawToken.split("/").filter(Boolean).pop() ?? rawToken) : rawToken;
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Paste an invite link or token");
      return;
    }
    setError("");
    setAccepting(trimmed);
    try {
      const { organization } = await api.acceptInvite(trimmed);
      onComplete(organization);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept invite");
    } finally {
      setAccepting(null);
    }
  };

  if (view === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-foreground-muted">Loading organizations...</div>
      </div>
    );
  }

  const titles: Record<Exclude<View, "loading">, { title: string; subtitle: string }> = {
    select: { title: "Select Organization", subtitle: "Choose an organization to continue" },
    create: { title: "Create Organization", subtitle: "Set up your organization to get started" },
    join: { title: "You've been invited", subtitle: "Join your team, or start a new organization" },
  };
  const { title, subtitle } = titles[view];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border-strong bg-surface text-base font-bold text-foreground">
            W
          </div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-foreground-secondary">{subtitle}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          {view === "select" && (
            <div className="space-y-2">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => onComplete(org)}
                  className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{org.name}</div>
                    <div className="data-mono mt-0.5 text-xs text-foreground-muted">{org.slug}</div>
                  </div>
                  {org.verified && (
                    <span className="status-badge" data-status="approved">
                      Verified
                    </span>
                  )}
                </button>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setView("create")}
                  className="btn btn-ghost flex-1 text-sm"
                >
                  Create new
                </button>
                {invites.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setView("join")}
                    className="btn btn-ghost flex-1 text-sm"
                  >
                    Join ({invites.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {view === "join" && (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.token}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{invite.organization.name}</div>
                    <div className="mt-0.5 text-xs text-foreground-muted">as {invite.role}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAccept(invite.token)}
                    disabled={accepting !== null}
                    className="btn btn-primary h-8 shrink-0 px-3 text-xs"
                  >
                    {accepting === invite.token ? "Joining..." : "Join"}
                  </button>
                </div>
              ))}
              <form
                onSubmit={(e) => { e.preventDefault(); void handleAccept(tokenInput); }}
                className="flex gap-2 pt-1"
              >
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Or paste an invite link"
                  className="input h-9 flex-1 text-xs"
                  disabled={accepting !== null}
                />
                <button type="submit" disabled={accepting !== null || !tokenInput.trim()} className="btn h-9 px-3 text-xs">
                  Join
                </button>
              </form>
              {error && (
                <div className="rounded-lg border border-danger p-3 text-xs" style={{ backgroundColor: "var(--color-danger-subtle)", color: "var(--color-danger)" }}>
                  {error}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {orgs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setView("select")}
                    className="btn btn-ghost flex-1 text-sm"
                  >
                    My organizations
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setView("create")}
                  className="btn btn-ghost flex-1 text-sm"
                >
                  Create new
                </button>
              </div>
            </div>
          )}

          {view === "create" && (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label htmlFor="org-name" className="mb-1.5 block text-xs font-medium text-foreground-secondary">
                  Organization Name
                </label>
                <input
                  id="org-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="input w-full"
                  autoFocus
                  disabled={saving}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-danger p-3 text-xs" style={{ backgroundColor: "var(--color-danger-subtle)", color: "var(--color-danger)" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="btn btn-primary h-10 w-full text-sm"
              >
                {saving ? "Creating..." : "Create Organization"}
              </button>

              {(orgs.length > 0 || invites.length > 0) && (
                <div className="flex gap-2">
                  {orgs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setView("select")}
                      className="w-full text-sm text-foreground-secondary hover:text-foreground"
                    >
                      Back to organization list
                    </button>
                  )}
                  {invites.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setView("join")}
                      className="w-full text-sm text-foreground-secondary hover:text-foreground"
                    >
                      Back to invites
                    </button>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
