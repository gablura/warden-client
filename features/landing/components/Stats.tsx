const STATS = [
  { value: "On-chain", label: "Policy enforcement" },
  { value: "< 2s", label: "Settlement time" },
  { value: "0%", label: "Custody risk" },
  { value: "100%", label: "Audit coverage" },
] as const;

export function Stats() {
  return (
    <section className="border-y border-border bg-surface py-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="data-mono text-lg font-semibold text-foreground sm:text-xl">
              {stat.value}
            </div>
            <div className="mt-1 text-xs text-foreground-secondary">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
