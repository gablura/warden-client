"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAuth } from "@/features/auth/useAuth";
import { useWardenClient } from "@/features/auth/useWardenClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { LiveIndicator } from "@/components/shared";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview", icon: "grid" },
  { href: "/dashboard/agents", label: "Agents", icon: "cpu" },
  { href: "/dashboard/approvals", label: "Approvals", icon: "check-circle" },
  { href: "/dashboard/audit", label: "Audit", icon: "list" },
] as const;

function SidebarIcon({ name }: { name: string }) {
  const icons: Record<string, React.JSX.Element> = {
    grid: <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" /><rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /></svg>,
    cpu: <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="8" height="8" rx="1" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="6" y1="12" x2="6" y2="14" /><line x1="10" y1="12" x2="10" y2="14" /><line x1="2" y1="6" x2="4" y2="6" /><line x1="2" y1="10" x2="4" y2="10" /><line x1="12" y1="6" x2="14" y2="6" /><line x1="12" y1="10" x2="14" y2="10" /></svg>,
    "check-circle": <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><polyline points="5.5 8 7 9.5 10.5 6.5" /></svg>,
    list: <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="4" x2="13" y2="4" /><line x1="3" y1="8" x2="13" y2="8" /><line x1="3" y1="12" x2="13" y2="12" /></svg>,
  };
  return icons[name] ?? null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { user, signOut: apiKeySignOut } = useAuth();
  const api = useWardenClient();

  const [connected, setConnected] = useState(false);

  // Resolve current org (reserved for future org switcher)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await api.getMe();
        if (cancelled) return;
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  // Track WebSocket connection state
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) return;
    const wsUrl = url.replace(/^http/, "ws");
    let socket: WebSocket | null = null;
    let cancelled = false;

    async function connect() {
      try {
        const { ticket } = await api.wsTicket();
        if (cancelled) return;
        socket = new WebSocket(`${wsUrl}/ws?ticket=${encodeURIComponent(ticket)}`);
        socket.onopen = () => {
          if (!cancelled) setConnected(true);
          socket?.send(JSON.stringify({ type: "subscribe", agents: ["*"] }));
        };
        socket.onclose = () => {
          if (!cancelled) setConnected(false);
        };
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    connect();
    return () => {
      cancelled = true;
      socket?.close();
    };
  }, [api]);

  const displayName = clerkUser?.emailAddresses[0]?.emailAddress
    ?? user?.email
    ?? user?.label
    ?? "User";
  const avatarUrl = clerkUser?.imageUrl;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const handleSignOut = async () => {
    try {
      if (clerkUser) await clerkSignOut();
      apiKeySignOut();
      router.push("/sign-in");
    } catch {
      apiKeySignOut();
      router.push("/sign-in");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-col border-r border-border bg-surface lg:flex">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-surface text-xs font-bold text-foreground">
              W
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-success" />
            </div>
            <span className="text-sm font-semibold text-foreground">Warden</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                isActive(link.href)
                  ? "bg-surface-raised font-medium text-foreground"
                  : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <SidebarIcon name={link.icon} />
              {link.label}
            </a>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full border border-border" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-xs font-medium text-foreground-secondary">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="data-mono truncate text-xs text-foreground-secondary" title={displayName}>
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={() => handleSignOut()} className="btn btn-ghost h-7 px-2 text-xs">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6" />
                  <polyline points="10 11 14 8 10 5" />
                  <line x1="14" y1="8" x2="6" y2="8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile + desktop content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar - always visible on mobile, hidden on desktop where sidebar owns it */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-surface text-xs font-bold text-foreground">
              W
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-success" />
            </div>
            <span className="text-sm font-semibold text-foreground">Warden</span>
          </Link>
          <div className="flex items-center gap-2">
            <LiveIndicator connected={connected} />
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-6 w-6 rounded-full border border-border" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-[10px] font-medium text-foreground-secondary">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => handleSignOut()} className="btn btn-ghost h-7 px-2 text-xs">
              Sign Out
            </button>
          </div>
        </header>

        {/* Mobile bottom nav bar */}
        <nav className="flex border-t border-border bg-surface px-2 py-1.5 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] transition-colors ${
                isActive(link.href)
                  ? "text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              <SidebarIcon name={link.icon} />
              {link.label}
            </a>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
