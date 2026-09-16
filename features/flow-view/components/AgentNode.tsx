import { memo } from "react";
import type { FlowTone } from "../types";

interface AgentNodeProps {
  x: number;
  y: number;
  label: string;
  sublabel: string;
  tone: FlowTone;
}

const toneColors: Record<FlowTone, { stroke: string; fill: string; ring: string }> = {
  success: { stroke: "var(--color-success)", fill: "var(--color-success-subtle)", ring: "var(--color-success)" },
  warning: { stroke: "var(--color-warning)", fill: "var(--color-warning-subtle)", ring: "var(--color-warning)" },
  danger: { stroke: "var(--color-danger)", fill: "var(--color-danger-subtle)", ring: "var(--color-danger)" },
  neutral: { stroke: "var(--color-border-strong)", fill: "var(--color-surface)", ring: "var(--color-border-strong)" },
};

export const AgentNode = memo(function AgentNode({ x, y, label, sublabel, tone }: AgentNodeProps) {
  const colors = toneColors[tone];

  return (
    <g>
      {/* Outer glow ring */}
      <circle
        cx={x}
        cy={y}
        r={28}
        fill="none"
        stroke={colors.ring}
        strokeWidth={1}
        opacity={tone === "neutral" ? 0 : 0.3}
      />
      {/* Node background */}
      <circle cx={x} cy={y} r={24} fill={colors.fill} stroke={colors.stroke} strokeWidth={1.5} />
      {/* Inner ring */}
      <circle cx={x} cy={y} r={20} fill="none" stroke={colors.stroke} strokeWidth={0.5} opacity={0.3} />
      {/* Agent label */}
      <text x={x} y={y - 3} textAnchor="middle" className="fill-foreground text-[11px] font-medium">
        {label}
      </text>
      {/* Spend sublabel */}
      <text x={x} y={y + 10} textAnchor="middle" className="fill-foreground-secondary text-[8px] font-mono">
        {sublabel}
      </text>
    </g>
  );
});

AgentNode.displayName = "AgentNode";
