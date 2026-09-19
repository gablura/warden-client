"use client";

import { useState } from "react";
import { RoleGate } from "@/components/shared";
import { shortenAddress } from "@/lib/format";
import type { AllowlistEntry } from "../types";

interface AllowlistEditorProps {
  agentAddress: string;
  entries: AllowlistEntry[];
  onSubmit: (input: { agent: string; counterparty: string; allowed: boolean }) => void;
  submitting?: boolean;
  /// Set while the last submission failed, so the editor can show why and
  /// stop pretending the change landed (policy state is chain-read only).
  error?: string | null;
}

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

/// Admin-only allowlist editor for one agent. Every toggle is a real
/// on-chain transaction (PolicyRegistry.setAllowlist), so each row's
/// action goes through ConfirmInline and disables the whole list while a
/// submission is in flight — same "one real tx at a time" discipline as
/// the policy panel above it.
export function AllowlistEditor({ agentAddress, entries, onSubmit, submitting, error }: AllowlistEditorProps) {
  const [newAddress, setNewAddress] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = newAddress.trim();
  const validNewAddress = EVM_ADDRESS.test(trimmed);
  const alreadyListed = entries.some((e) => e.counterparty.toLowerCase() === trimmed.toLowerCase());

  const handleAdd = () => {
    if (!validNewAddress || alreadyListed) return;
    onSubmit({ agent: agentAddress, counterparty: trimmed, allowed: true });
    setNewAddress("");
    setTouched(false);
  };

  return (
    <RoleGate
      minRole="admin"
      fallback={
        <EntryList entries={entries} emptyMessage="No counterparties allowed yet." />
      }
    >
      <div className="space-y-3">
        <EntryList
          entries={entries}
          emptyMessage="No counterparties allowed yet — add one below to let this agent pay it."
          submitting={submitting}
          onToggle={(entry) =>
            onSubmit({ agent: agentAddress, counterparty: entry.counterparty, allowed: !entry.allowed })
          }
        />

        <div>
          <label htmlFor="allowlist-address" className="mb-1 block text-xs text-foreground-muted">
            Allow a counterparty (EVM address)
          </label>
          <div className="flex gap-2">
            <input
              id="allowlist-address"
              type="text"
              value={newAddress}
              onChange={(e) => { setNewAddress(e.target.value); setTouched(true); }}
              placeholder="0x…"
              className="input h-9 flex-1 text-xs"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting || !validNewAddress || alreadyListed}
              className="btn btn-primary h-9 px-3 text-xs"
            >
              Allow
            </button>
          </div>
          {touched && trimmed && !validNewAddress && (
            <p className="mt-1 text-xs text-red-500">Enter a full EVM address (0x followed by 40 hex characters).</p>
          )}
          {touched && alreadyListed && validNewAddress && (
            <p className="mt-1 text-xs text-foreground-muted">Already in this agent&apos;s allowlist.</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-danger/10 p-2 text-xs text-danger">{error}</div>
        )}
      </div>
    </RoleGate>
  );
}

interface EntryListProps {
  entries: AllowlistEntry[];
  emptyMessage: string;
  submitting?: boolean;
  onToggle?: (entry: AllowlistEntry) => void;
}

function EntryList({ entries, emptyMessage, submitting, onToggle }: EntryListProps) {
  if (entries.length === 0) {
    return <p className="text-xs text-foreground-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <li key={entry.counterparty} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <div className="data-mono truncate text-xs text-foreground">
              {shortenAddress(entry.counterparty)}
            </div>
            <div className={`text-[10px] ${entry.allowed ? "text-success" : "text-foreground-muted"}`}>
              {entry.allowed ? "Allowed" : "Blocked"}
            </div>
          </div>
          {onToggle && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => onToggle(entry)}
              className="btn h-8 shrink-0 px-3 text-xs"
            >
              {entry.allowed ? "Block" : "Allow"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
