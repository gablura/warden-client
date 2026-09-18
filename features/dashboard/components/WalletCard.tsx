"use client";

import { useState, useCallback } from "react";
import { useWardenClient } from "@/features/auth/useWardenClient";

interface WalletCardProps {
  address: string | null | undefined;
  status: string | null | undefined;
  orgId?: string;
}

function statusConfig(status: string | null | undefined) {
  switch (status) {
    case "ready":
      return {
        label: "Active",
        color: "var(--color-success)",
        bgColor: "var(--color-success-subtle)",
        dotClass: "bg-success",
      };
    case "pending":
      return {
        label: "Provisioning",
        color: "var(--color-warning)",
        bgColor: "var(--color-warning-subtle)",
        dotClass: "bg-warning animate-pulse",
      };
    default:
      return {
        label: "Unavailable",
        color: "var(--color-danger)",
        bgColor: "var(--color-danger-subtle)",
        dotClass: "bg-danger",
      };
  }
}

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

export function WalletCard({ address, status, orgId }: WalletCardProps) {
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const api = useWardenClient();

  const config = statusConfig(status);
  const displayAddress = address ? shortAddress(address) : "No wallet";
  const explorerUrl = address
    ? `https://explorer.testnet.arc.io/address/${address}`
    : null;

  const handleCopy = useCallback(async () => {
    if (!address) return;
    try {
      await copyToClipboard(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }, [address]);

  const handleRetry = useCallback(async () => {
    if (retrying) return;
    setRetrying(true);
    setRetryError(null);
    try {
      await api.retryWallet();
      // Force page reload to pick up new wallet state
      window.location.reload();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Retry failed");
      setTimeout(() => setRetryError(null), 3000);
    } finally {
      setRetrying(false);
    }
  }, [retrying, api]);

  return (
    <div className="surface group relative overflow-hidden transition-all hover:shadow-md">
      {/* Accent top border */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: config.color }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ backgroundColor: config.bgColor }}
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke={config.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="12" height="9" rx="1.5" />
                <path d="M2 6.5h12" />
                <circle cx="5.5" cy="9.5" r="1" />
              </svg>
            </div>
            <span className="text-xs font-medium text-foreground-secondary">
              Wallet
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${config.dotClass}`}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="mb-3">
          {address ? (
            <div className="flex items-center gap-2">
              <code className="data-mono text-sm text-foreground">
                {displayAddress}
              </code>
              <button
                onClick={handleCopy}
                className="flex h-6 w-6 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised hover:text-foreground"
                title={copied ? "Copied!" : "Copy full address"}
              >
                {copied ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3.5 8 6.5 11 12.5 5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="5" width="8" height="8" rx="1" />
                    <path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <span className="text-sm text-foreground-muted">—</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost flex h-7 items-center gap-1.5 px-2.5 text-xs"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V10" />
                <path d="M8 2h6v6" />
                <path d="M14 2L7 9" />
              </svg>
              Explorer
            </a>
          )}
          {status !== "ready" && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="btn btn-ghost flex h-7 items-center gap-1.5 px-2.5 text-xs"
            >
              {retrying ? (
                <>
                  <svg
                    className="h-3 w-3 animate-spin"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 2a6 6 0 1 0 6 6" strokeLinecap="round" />
                  </svg>
                  Retrying...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 8a6 6 0 0 1 10.47-4" />
                    <path d="M14 8a6 6 0 0 1-10.47 4" />
                    <polyline points="12 1 12 4 9 4" />
                    <polyline points="4 15 4 12 7 12" />
                  </svg>
                  Retry
                </>
              )}
            </button>
          )}
        </div>

        {/* Retry error */}
        {retryError && (
          <p className="mt-2 text-[10px] text-danger">{retryError}</p>
        )}
      </div>
    </div>
  );
}
