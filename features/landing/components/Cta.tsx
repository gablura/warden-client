export function Cta() {
  return (
    <section className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Start governing agent spending today
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-foreground-secondary sm:text-base">
          Deploy Warden in minutes. Set policies per agent, require approvals
          for high-value transactions, and get a complete audit trail from day
          one.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="/dashboard" className="btn btn-primary px-6 py-2.5">
            Open Dashboard
          </a>
          <a
            href="https://github.com/anomalyco/warden"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost px-6 py-2.5"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
