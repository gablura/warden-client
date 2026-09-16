"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/features/auth/useAuth";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { user, isAuthenticated, isLoading, signOut: apiKeySignOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const openRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleMobile = () => {
    openRef.current = !openRef.current;
    setMobileOpen(openRef.current);
  };

  const closeMobile = () => {
    openRef.current = false;
    setMobileOpen(false);
  };

  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      closeMobile();
    }
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      if (clerkUser) {
        await clerkSignOut();
      }
      apiKeySignOut();
      closeMobile();
    } catch (error) {
      console.error("Sign out error:", error);
      // Force cleanup even if sign out fails
      apiKeySignOut();
      closeMobile();
    }
  };

  const isActive = (href: string) => pathname === href;

  // Display name: Clerk user > API key user
  const displayName = clerkUser?.emailAddresses[0]?.emailAddress
    ?? user?.email
    ?? user?.label
    ?? "";

  const avatarUrl = clerkUser?.imageUrl;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-200 ${
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-surface text-xs font-bold text-foreground">
              W
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-success" />
            </div>
            <span className="text-sm font-semibold text-foreground">Warden</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href)
                    ? "font-medium text-foreground"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
                <div className="h-8 w-20 animate-pulse rounded bg-border" />
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="data-mono max-w-[120px] truncate text-xs text-foreground-secondary" title={displayName}>
                  {displayName}
                </span>
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-6 w-6 rounded-full border border-border"
                  />
                )}
                <a href="/dashboard" className="btn btn-primary h-8 px-3.5 text-xs">
                  Dashboard
                </a>
                <button onClick={() => handleSignOut()} className="btn btn-ghost h-8 px-2.5 text-xs">
                  Sign Out
                </button>
              </div>
            ) : (
              <a href="/sign-in" className="btn btn-primary h-8 px-3.5 text-xs">
                Sign In
              </a>
            )}
          </div>

          {/* Mobile: hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobile}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground-secondary transition-colors hover:border-border-strong hover:text-foreground"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {mobileOpen ? (
                  <>
                    <line x1="4" y1="4" x2="12" y2="12" />
                    <line x1="12" y1="4" x2="4" y2="12" />
                  </>
                ) : (
                  <>
                    <line x1="2" y1="5" x2="14" y2="5" />
                    <line x1="2" y1="8" x2="14" y2="8" />
                    <line x1="2" y1="11" x2="14" y2="11" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Mobile menu */}
      <div
        className={`fixed top-14 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-all duration-200 md:hidden ${
          mobileOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive(link.href)
                  ? "bg-surface font-medium text-foreground"
                  : "text-foreground-secondary hover:bg-surface hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="my-1 h-px bg-border" />
          {isLoading ? (
            <div className="flex items-center gap-3 rounded-md px-3 py-2">
              <div className="h-5 w-5 animate-pulse rounded-full bg-border" />
              <div className="h-4 w-24 animate-pulse rounded bg-border" />
            </div>
          ) : isAuthenticated ? (
            <>
              <div className="flex items-center justify-between rounded-md px-3 py-2">
                <div className="flex items-center gap-2">
                  {avatarUrl && (
                    <img src={avatarUrl} alt="" className="h-5 w-5 rounded-full border border-border" />
                  )}
                  <span className="data-mono max-w-[140px] truncate text-xs text-foreground-secondary" title={displayName}>
                    {displayName}
                  </span>
                </div>
              </div>
              <a
                href="/dashboard"
                onClick={closeMobile}
                className="btn btn-primary w-full py-2.5 text-sm"
              >
                Open Dashboard
              </a>
              <button
                onClick={() => handleSignOut()}
                className="btn btn-ghost w-full py-2.5 text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              href="/sign-in"
              onClick={closeMobile}
              className="btn btn-primary w-full py-2.5 text-sm"
            >
              Sign In
            </a>
          )}
          <div className="flex items-center justify-center gap-3 border-t border-border pt-3 mt-1">
            <span className="text-xs text-foreground-muted">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
