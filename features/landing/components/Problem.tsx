export function Problem() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              AI agents are spending money.
              <br />
              <span className="text-foreground-secondary">
                Most teams have no visibility.
              </span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground-secondary sm:text-base">
              Autonomous agents are making real payments — purchasing compute,
              settling invoices, paying suppliers. But most teams discover
              overspending weeks later, when the invoice arrives. There is no
              policy layer, no approval workflow, no real-time view of who is
              spending what.
            </p>
          </div>

          <div className="surface p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-subtle">
                  <svg viewBox="0 0 12 12" className="h-3 w-3 text-danger" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="3" x2="9" y2="9" />
                    <line x1="9" y1="3" x2="3" y2="9" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">No spend limits</div>
                  <div className="mt-0.5 text-xs text-foreground-secondary">
                    Agents can spend unlimited amounts without any guardrails
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-subtle">
                  <svg viewBox="0 0 12 12" className="h-3 w-3 text-danger" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="3" x2="9" y2="9" />
                    <line x1="9" y1="3" x2="3" y2="9" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">No human oversight</div>
                  <div className="mt-0.5 text-xs text-foreground-secondary">
                    High-value transactions go through without anyone reviewing them
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-subtle">
                  <svg viewBox="0 0 12 12" className="h-3 w-3 text-danger" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="3" x2="9" y2="9" />
                    <line x1="9" y1="3" x2="3" y2="9" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">No audit trail</div>
                  <div className="mt-0.5 text-xs text-foreground-secondary">
                    When something goes wrong, there is no record of what happened or why
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
