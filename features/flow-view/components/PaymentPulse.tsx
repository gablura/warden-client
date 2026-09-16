import { memo } from "react";
import type { FlowTone } from "../types";

interface PaymentPulseProps {
  path: string;
  tone: Exclude<FlowTone, "neutral">;
  durationSeconds?: number;
}

const toneFill: Record<Exclude<FlowTone, "neutral">, string> = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
};

export const PaymentPulse = memo(function PaymentPulse({ path, tone, durationSeconds = 2.5 }: PaymentPulseProps) {
  const color = toneFill[tone];

  return (
    <g>
      {/* Trail */}
      <circle r={2} fill={color} opacity={0.3}>
        <animateMotion
          dur={`${durationSeconds}s`}
          repeatCount="indefinite"
          path={path}
          begin={`-${durationSeconds * 0.15}s`}
        />
      </circle>
      {/* Main pulse */}
      <circle r={4} fill={color}>
        <animateMotion dur={`${durationSeconds}s`} repeatCount="indefinite" path={path} />
      </circle>
      {/* Bright center */}
      <circle r={1.5} fill="white" opacity={0.8}>
        <animateMotion dur={`${durationSeconds}s`} repeatCount="indefinite" path={path} />
      </circle>
    </g>
  );
});

PaymentPulse.displayName = "PaymentPulse";
