const PRODUCT_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/agents", label: "Agent Registry" },
  { href: "/dashboard/approvals", label: "Approval Inbox" },
  { href: "/dashboard/audit", label: "Audit Log" },
] as const;

const RESOURCE_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "https://github.com/anomalyco/warden", label: "GitHub", external: true },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-surface text-xs font-bold text-foreground">
                W
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-success" />
              </div>
              <span className="text-sm font-semibold text-foreground">Warden</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-foreground-secondary">
              Governance and visibility for AI agents that move money. Enforce
              limits, require approvals, maintain audit trails.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Product
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Resources
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-1 text-sm text-foreground-secondary transition-colors hover:text-foreground"
                  >
                    {link.label}
                    {link.external && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 8.5l5-5M4 3.5h4.5V8" />
                      </svg>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Legal
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-foreground-muted">
            &copy; {new Date().getFullYear()} Warden. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/anomalyco/warden"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
