const TRUST_ITEMS = [
  {
    title: "Non-custodial by design",
    description:
      "Warden never holds agent funds. SpendGuard is an authorized spender — it pulls approved amounts directly from agent wallets. Nothing is ever pooled.",
  },
  {
    title: "On-chain enforcement",
    description:
      "Policy limits are smart contract state, not server-side checks. No amount of backend compromise can bypass a daily cap that lives on-chain.",
  },
  {
    title: "Open source",
    description:
      "Every contract, every route, every component is auditable. Fork it, inspect it, run it yourself. Trust is not a promise — it is a verifiable property.",
  },
] as const;

export function Trust() {
  return (
    <section className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
          Built for trust
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-foreground-secondary sm:text-base">
          When you are governing real money, &quot;just trust us&quot; is not
          enough. Every design decision in Warden is auditable.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-secondary sm:text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
