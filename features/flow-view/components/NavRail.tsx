import Link from "next/link";

const NAV_LINKS = [
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/policies", label: "Policies" },
  { href: "/dashboard/approvals", label: "Approvals" },
  { href: "/dashboard/audit", label: "Audit" },
] as const;

/**
 * No "use client" — this never needs interactivity of its own, and
 * next/link prefetches each route's data in the background as soon as
 * this renders, so tapping through feels instant later.
 */
export function NavRail() {
  return (
    <nav className="mt-6 flex justify-around border-t border-border pt-3 text-sm">
      {NAV_LINKS.map((item) => (
        <Link key={item.href} href={item.href} className="link">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}