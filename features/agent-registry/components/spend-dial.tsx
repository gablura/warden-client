interface SpendDialProps {
  spent: bigint;
  cap: bigint;
}

export function SpendDial({ spent, cap }: SpendDialProps) {
  const pct = cap > BigInt(0) ? Number((spent * BigInt(100)) / cap) : 0;
  const clamped = Math.min(pct, 100);
  const dollars = Number(spent) / 1_000_000;
  const capDollars = Number(cap) / 1_000_000;

  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;

  let strokeColor = "var(--color-success)";
  if (pct >= 80) strokeColor = "var(--color-danger)";
  else if (pct >= 50) strokeColor = "var(--color-warning)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          className="transition-all"
          style={{ transitionDuration: "var(--duration-base)", transitionTimingFunction: "var(--ease-standard)" }}
        />
        <text
          x="44"
          y="44"
          textAnchor="middle"
          dominantBaseline="central"
          className="data-mono"
          fill="var(--color-foreground)"
          fontSize="14"
          fontWeight="600"
        >
          {Math.round(pct)}%
        </text>
      </svg>
      <div className="data-mono text-center text-xs text-foreground-secondary">
        ${dollars.toLocaleString("en-US", { maximumFractionDigits: 2 })} / ${capDollars.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </div>
      <div className="text-xs text-foreground-muted">spent today</div>
    </div>
  );
}
