const STAGES = [
  {
    label: "Agent",
    sublabel: "Initiates payment",
    tone: "var(--color-foreground-secondary)",
  },
  {
    label: "Policy Gate",
    sublabel: "Checks caps, approvals",
    tone: "var(--color-warning)",
  },
  {
    label: "Settlement",
    sublabel: "USDC transferred",
    tone: "var(--color-success)",
  },
  {
    label: "Audit Log",
    sublabel: "Recorded on-chain",
    tone: "var(--color-info)",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-foreground-secondary sm:text-base">
          Every agent payment passes through the same pipeline. Policy
          enforcement is on-chain, settlement is non-custodial, and every
          decision is logged.
        </p>

        {/* Desktop: horizontal flow */}
        <div className="mt-12 hidden items-start justify-between gap-4 sm:flex">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="flex flex-1 items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold"
                  style={{
                    borderColor: stage.tone,
                    color: stage.tone,
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  {i + 1}
                </div>
                {i < STAGES.length - 1 && (
                  <div className="mt-5 h-px flex-1 bg-border" style={{ minWidth: "2rem" }} />
                )}
              </div>
              <div className="pt-2">
                <div className="text-sm font-semibold text-foreground">
                  {stage.label}
                </div>
                <div className="mt-0.5 text-xs text-foreground-secondary">
                  {stage.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: vertical flow */}
        <div className="mt-12 flex flex-col gap-0 sm:hidden">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                  style={{
                    borderColor: stage.tone,
                    color: stage.tone,
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  {i + 1}
                </div>
                {i < STAGES.length - 1 && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pb-8 pt-1">
                <div className="text-sm font-semibold text-foreground">
                  {stage.label}
                </div>
                <div className="mt-0.5 text-xs text-foreground-secondary">
                  {stage.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Static SVG flow diagram — desktop only */}
        <div className="mt-16 hidden sm:block">
          <svg
            viewBox="0 0 720 120"
            className="mx-auto h-auto w-full max-w-2xl"
            role="img"
            aria-label="Agent payment flow: Agent sends payment through Policy Gate to Settlement, then to Audit Log"
          >
            <title>Payment flow overview</title>

            {/* Edges */}
            <line x1="80" y1="48" x2="240" y2="48" stroke="var(--color-border-strong)" strokeWidth="1.5" />
            <line x1="340" y1="48" x2="500" y2="48" stroke="var(--color-border-strong)" strokeWidth="1.5" />
            <line x1="600" y1="48" x2="720" y2="48" stroke="var(--color-border-strong)" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Arrow heads */}
            <polygon points="236,44 244,48 236,52" fill="var(--color-border-strong)" />
            <polygon points="496,44 504,48 496,52" fill="var(--color-border-strong)" />
            <polygon points="696,44 704,48 696,52" fill="var(--color-border-strong)" />

            {/* Agent node */}
            <circle cx="80" cy="48" r="28" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
            <text x="80" y="45" textAnchor="middle" className="fill-foreground text-[11px] font-medium">Agent</text>
            <text x="80" y="57" textAnchor="middle" className="fill-foreground-secondary text-[8px]">0x1234…abcd</text>

            {/* Policy Gate */}
            <rect x="240" y="20" width="100" height="56" rx="10" fill="var(--color-warning-subtle)" stroke="var(--color-warning)" strokeWidth="1" />
            <text x="290" y="44" textAnchor="middle" className="fill-warning text-[11px] font-medium">Policy Gate</text>
            <text x="290" y="57" textAnchor="middle" className="fill-foreground-secondary text-[8px]">check &amp; approve</text>

            {/* Settlement */}
            <rect x="500" y="20" width="100" height="56" rx="10" fill="var(--color-success-subtle)" stroke="var(--color-success)" strokeWidth="1" />
            <text x="550" y="44" textAnchor="middle" className="fill-success text-[11px] font-medium">Settlement</text>
            <text x="550" y="57" textAnchor="middle" className="fill-foreground-secondary text-[8px]">$12.50 USDC</text>

            {/* Audit Log */}
            <rect x="720" y="20" width="100" height="56" rx="10" fill="var(--color-info-subtle)" stroke="var(--color-info)" strokeWidth="1" />
            <text x="770" y="44" textAnchor="middle" className="fill-info text-[11px] font-medium">Audit Log</text>
            <text x="770" y="57" textAnchor="middle" className="fill-foreground-secondary text-[8px]">on-chain</text>

            {/* Labels under edges */}
            <text x="160" y="76" textAnchor="middle" className="fill-foreground-muted text-[9px]">request</text>
            <text x="420" y="76" textAnchor="middle" className="fill-foreground-muted text-[9px]">settled</text>
            <text x="660" y="76" textAnchor="middle" className="fill-foreground-muted text-[9px]">recorded</text>
          </svg>
        </div>
      </div>
    </section>
  );
}
