interface Feature {
  title: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: "Policy Engine",
    description:
      "Granular daily caps, per-transaction limits, and role-based access — enforced on-chain for every agent.",
    icon: ShieldIcon,
  },
  {
    title: "Approval Workflows",
    description:
      "Multi-tier escalation with timeout, scope enforcement, and collision detection before gas is spent.",
    icon: CheckCircleIcon,
  },
  {
    title: "Non-Custodial",
    description:
      "Agents keep their funds. SpendGuard pulls only what's approved — nothing is ever pooled or held.",
    icon: LockIcon,
  },
  {
    title: "Audit Trail",
    description:
      "Every decision recorded on-chain and indexed for search. Who approved what, when, and why.",
    icon: FileTextIcon,
  },
  {
    title: "Real-Time Monitoring",
    description:
      "Live WebSocket feed of payments, blocked attempts, and system health across your agent fleet.",
    icon: ActivityIcon,
  },
  {
    title: "Emergency Stop",
    description:
      "One-click pause on all settlement. Rejection still works while paused — empty the queue safely.",
    icon: AlertTriangleIcon,
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
          Everything you need to govern agent spending
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-foreground-secondary sm:text-base">
          Six capabilities that cover the full lifecycle — from policy definition
          to settlement to post-mortem.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="surface flex flex-col gap-3 p-5 sm:p-6"
            >
              <feature.icon className="h-5 w-5 text-foreground-secondary" />
              <h3 className="text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-foreground-secondary sm:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
