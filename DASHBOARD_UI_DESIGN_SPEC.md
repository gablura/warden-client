# Dashboard UI design spec — Agents, Approvals, Audit (+ the shared shell)

Product name is still provisional pending the rename — this spec uses "the dashboard" throughout rather than the old name, so nothing here needs rewriting once that's settled.

No code in this doc on purpose — this is the thing to sit with and sketch against before anything gets built.

---

## 0. The shell change this implies

Everything below assumes one structural change from what exists today: **`NavRail` stops being a permanent bottom bar and becomes responsive** — a persistent left sidebar on desktop (`md:` and up), collapsing to a bottom tab bar only on mobile. A four-page authenticated app (soon five, with Policies) genuinely benefits from always-visible navigation and an org/user context area, which a bottom rail alone can't hold. This is a layout-level component, not a per-page one — it lives in `app/(protected)/layout.tsx`, wrapping every page below.

**Shell contents:**
- **Sidebar (desktop) / tab bar (mobile):** the four nav items, unchanged icons/labels, same `.link` token styling.
- **Topbar:** org name (with a switcher, if multi-org membership is ever real), a live-status dot (reuse the "live" indicator concept from the homepage preview — green dot + label, tied to actual WebSocket connection state, not decorative), user menu (avatar-less is fine — initials in a circle, using `--color-surface`/`--color-border` tokens — with logout).
- **Role awareness at the shell level:** a `RoleGate` component (wraps children, renders nothing — or a disabled/explainer state — if the session role doesn't meet the required minimum) becomes the one place every page's role logic routes through, rather than each page reimplementing "is this an admin" checks.

---

## 1. Shared components — build these once, before any page-specific work

Building these first means every page below is assembly, not new construction.

| Component | What it does | Why it's shared |
|---|---|---|
| `DataTable` | Generic sortable table shell — desktop table, mobile stacked-card fallback at the same breakpoint | Agents and Audit both need this; building one generic version now avoids two slightly-different table implementations later |
| `FilterBar` | Horizontal row of filter controls (search, dropdowns, chips) that collapses to a "Filters" sheet/drawer on mobile | Agents (search/status) and Audit (agent/date/decision) both need filtering |
| `EmptyState` | Icon-free, text-first empty state — a short sentence, optional single action | Every list view needs one; a calm, non-illustrated empty state fits the restrained aesthetic better than a cartoon graphic |
| `LoadMoreButton` | Cursor-based "load more" control, not numbered pagination | Audit specifically (per the keyset-pagination guide), reusable anywhere a list can grow indefinitely |
| `ConfirmInline` | A lightweight "tap again to confirm" affordance for destructive/costly actions, not a modal | Approvals (approve/reject both spend gas) — a modal is too heavy for something meant to be doable from a phone notification |
| `RoleGate` | Conditionally renders children based on session role | Any admin-only or approver-only UI, across every page |
| `LiveIndicator` | Small dot + label showing WebSocket connection state | Topbar, and anywhere else live data is shown, so "is this actually live right now" is never ambiguous |

None of these are page-specific — putting a page name in any of their filenames is a sign it's been scoped wrong.

---

## 2. `/dashboard` (flow view) — one addition given the new shell

Already built. The only change: it now renders inside the persistent shell instead of owning the full page, so `EventTicker`/`FlowGraph`/`ReadoutRow` stay exactly as they are — just remove the page-local `NavRail` render, since the shell now owns navigation everywhere.

---

## 3. `/dashboard/agents`

**Purpose:** the roster — every agent under governance, at a glance, with a path into per-agent policy detail.

### List view
- **Desktop:** a table via the shared `DataTable`. Columns, left to right: Agent (label over a monospace shortened address — two-line cell, matches the pattern already established in the flow view), Status (`StatusBadge`, reused as-is), Spent today vs. daily cap (a compact horizontal bar, not the circular `ReadoutDial` — a dial doesn't work at table-row scale; a thin horizontal bar filled proportionally, same success/warning/danger tone logic as everywhere else), Per-tx cap, Last activity (relative time, "3m ago").
- **Mobile:** the same data as stacked cards — one agent per card, same fields, just vertically arranged instead of columned. This is the `DataTable`'s built-in responsive fallback, not a separate component.
- Row/card tap → navigates to the passport detail page.
- **Empty state:** "No agents registered yet." — plus a "Register an agent" action, but only rendered for admins (`RoleGate`).
- **Filter bar:** search by label/address, status filter (active/inactive), sort toggle (spent today, high to low, is the one sort worth having by default — it's the "who's using the most budget" question people actually ask).

### Detail — Agent Passport (`/dashboard/agents/[address]`)
- **Identity header:** label + full address (copyable), status badge, "controlled by" note if it's a smart-contract wallet vs. an EOA.
- **Policy panel:** daily cap, per-tx cap, escalation threshold — read-only fields for everyone, editable inline (not a separate edit page/modal — this is a small enough form to live in place) only inside a `RoleGate` for admins. Saving triggers the same on-chain `setPolicy` write already built server-side.
- **Allowlist editor:** a simple add/remove list of counterparty addresses, admin-only, same `RoleGate` pattern.
- **Spend-today readout:** here is where the circular `ReadoutDial` belongs — one agent, one dial, showing today's spend against its own cap. Table rows get the bar; the detail page gets the dial. Same data, different component for a different context, not a conflict.
- **Recent activity:** a scoped-down instance of the Audit table (same `DataTable`, filtered to this agent, no need for the full filter bar since the agent filter is implicit) — this is the actual argument for building `DataTable` generically instead of building an Audit-specific table and an Agents-specific table separately.

---

## 4. `/dashboard/approvals`

**Purpose:** the highest-urgency page in the app. Design for speed and confidence, not density.

### Why cards, not a table
Every other list page in this app is table-shaped because the data is naturally tabular. Approvals isn't — each pending item needs enough context (amount, reason, cap-fit status, two prominent action buttons) that cramming it into table columns would either truncate the important parts or force horizontal scrolling on exactly the page most likely to be used one-handed on a phone. One card per pending request, stacked vertically, works on every screen size without a separate mobile layout.

### Each `ApprovalCard` shows
- Agent (label + short address) and counterparty, same treatment as elsewhere.
- **Amount, large and prominent** — this is the one number on this page that matters most; give it real visual weight (bigger, monospace, high-contrast), not the same size as everything else on the card.
- **Why it escalated** — "exceeds per-tx cap" or "above escalation threshold," stated plainly, not just implied by it being on this page.
- **Cap-fit indicator** — the live "would this still fit if approved right now" check discussed earlier, computed against the current `spentToday`. Render this as a small inline badge next to the amount: fits cleanly (success tone), or a specific warning ("would exceed remaining cap by $X") in warning/danger tone. This is the single highest-value piece of UI on this page — it's the difference between an approver discovering a conflict via a failed transaction and seeing it before they tap anything.
- **Age** — how long it's been waiting, and worth color-coding softly: fresh requests read as neutral, anything sitting for an unusually long time gets a subtle visual nudge (not alarming, just noticeable) so aging requests don't get buried under newer ones.
- **Approve / Reject** — two clearly distinct buttons, `.btn-primary` and `.btn-danger` respectively (both already defined in the token system). Minimum 44×44px tap target on both — this page is explicitly designed to be usable from a phone notification, so touch-target sizing isn't optional polish here, it's the actual requirement.

### Interaction details
- Approve uses `ConfirmInline` (tap once to arm, tap again within a couple seconds to actually fire) rather than a modal — fast, but not a single fat-fingerable tap for something that spends real money.
- Reject gets an optional short reason field, expandable inline rather than a separate dialog — worth capturing for the audit trail, but shouldn't block a fast reject if the approver doesn't want to type anything.
- While a transaction is in flight: the button shows a spinner and disables (both buttons on that card, not just the one tapped, so a double-submit on a slow connection can't happen), then resolves to a brief success or failure toast.
- **Default ordering:** oldest first — matches the existing `GET /approvals` ordering and is the fairest default; a sort toggle (by amount) is a reasonable addition, not a requirement for v1.
- **Empty state:** something calm and positive — "Nothing pending. You're caught up." — this page being empty is a good outcome, the copy should read that way.

---

## 5. `/dashboard/audit`

**Purpose:** the compliance/history view. Lower urgency, higher information density than Approvals — this is the one page where a dense table is exactly right.

### Table
Via the shared `DataTable`: Timestamp, Agent, Counterparty, Amount, Decision (`StatusBadge`), Tx hash (monospace, shortened, and — once there's somewhere to send it — linked out to a block explorer).

### Filters
Via the shared `FilterBar`: agent (searchable, not a giant dropdown once there are many agents), date range, decision type (multi-select chips: approved/blocked/escalated — chips read faster than a dropdown for a 3-option filter and make the active filter state visible at a glance).

### Pagination
`LoadMoreButton`, cursor-based — matches the `?limit=`/keyset-pagination guide directly. No numbered pages; this is an append-only, ever-growing log, and offset pagination is the wrong tool for that shape of data.

### Row detail
Clicking a row expands it inline (accordion), rather than navigating to a separate detail page — the full decision reason (a blocked reason can be a full sentence) shows in the expanded space. Keeps someone scanning fifty rows in one place instead of navigating away and back fifty times.

### Export
A button hitting the CSV export endpoint. One honest caveat worth designing around now rather than discovering later: the export endpoint doesn't currently accept the same filters the table view does, so either the button needs to say plainly "exports full log" regardless of active filters, or the backend needs a matching filtered-export capability before the button can honestly claim to export "this view."

### Empty state
"No activity in this range," with a one-tap "clear filters" action — the most common reason this page is empty is an overly narrow filter, not an actually-quiet system.

---

## 6. Motion and consistency notes

Reuse the existing `--duration-fast`/`--duration-base`/`--ease-standard` tokens for everything here — a newly-arrived approval card (pushed in via WebSocket) getting a brief highlight pulse, a row expanding in the audit table, a button's loading-state transition. One shared timing system across every page, the same principle already applied to the ticker and flow-graph pulses on the homepage — not four pages independently inventing their own animation feel.

## 7. Component-size discipline, applied to this spec

Every component named above should map to roughly the same size tiers already established: `ApprovalCard`, `AgentRow`, `AuditRow` are small, single-purpose, and likely candidates for `memo()` since they re-render often under live data. `ApprovalQueue`, `AgentTable`, `AuditTable` are feature-level compositions — the orchestration layer, not where the visual detail lives. If any single file starts holding both "what this looks like" and "how the live data flows into it," that's the signal to split it, the same way `FlowView`/`FlowGraph`/`useLiveFeed` were kept as three separate concerns instead of one large component.