import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "info" | "neutral";

interface ReadoutDialProps {
  label: string;
  value: string;
  /** 0–1. Values outside this range are clamped, never overflow the ring. */
  fraction: number;
  tone: Tone;
  className?: string;
}

const RADIUS = 44;
const STROKE = 7;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const VIEWBOX = 120;

const toneVar: Record<Tone, { ring: string; glow: string; bg: string }> = {
  success: { ring: "var(--color-success)", glow: "var(--color-success-subtle)", bg: "var(--color-success-subtle)" },
  warning: { ring: "var(--color-warning)", glow: "var(--color-warning-subtle)", bg: "var(--color-warning-subtle)" },
  info: { ring: "var(--color-info)", glow: "var(--color-info-subtle)", bg: "var(--color-info-subtle)" },
  neutral: { ring: "var(--color-foreground-secondary)", glow: "var(--color-border)", bg: "var(--color-border)" },
};

export function ReadoutDial({ label, value, fraction, tone, className }: ReadoutDialProps) {
  const clamped = Math.min(Math.max(fraction, 0), 1);
  const filled = clamped * CIRCUMFERENCE;
  const colors = toneVar[tone];
  const cx = VIEWBOX / 2;
  const cy = VIEWBOX / 2;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="h-28 w-28 sm:h-36 sm:w-36"
          role="img"
          aria-label={`${label}: ${value}`}
        >
          {/* Glow filter */}
          <defs>
            <filter id={`glow-${tone}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track ring */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={STROKE}
            opacity={0.5}
          />

          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke={colors.ring}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            filter={`url(#glow-${tone})`}
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75].map((pct) => {
            const angle = (pct / 100) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = cx + (RADIUS + STROKE + 2) * Math.cos(rad);
            const y1 = cy + (RADIUS + STROKE + 2) * Math.sin(rad);
            const x2 = cx + (RADIUS + STROKE + 5) * Math.cos(rad);
            const y2 = cy + (RADIUS + STROKE + 5) * Math.sin(rad);
            return (
              <line
                key={pct}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-border-strong)"
                strokeWidth={1}
                strokeLinecap="round"
              />
            );
          })}

          {/* Center value */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground"
            fontSize="16"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            {value}
          </text>

          {/* Label below value */}
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            className="fill-foreground-secondary"
            fontSize="8"
            fontWeight="500"
            letterSpacing="0.05em"
          >
            {label.toUpperCase()}
          </text>
        </svg>

        {/* Percentage badge */}
        <div
          className="absolute -right-1 -top-1 flex h-6 items-center rounded-full px-1.5 text-[10px] font-semibold"
          style={{ backgroundColor: colors.bg, color: colors.ring }}
        >
          {Math.round(clamped * 100)}%
        </div>
      </div>
    </div>
  );
}
