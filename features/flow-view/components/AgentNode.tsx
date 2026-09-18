import { memo } from "react";
import type { FlowTone } from "../types";

interface AgentNodeProps {
  x: number;
  y: number;
  label: string;
  sublabel: string;
  tone: FlowTone;
}

const toneColors: Record<FlowTone, { stroke: string; fill: string }> = {
  success: { stroke: "#157f5a", fill: "#e4f5ec" },
  warning: { stroke: "#92620c", fill: "#fbf0dd" },
  danger: { stroke: "#b23a34", fill: "#fbeae9" },
  neutral: { stroke: "#c9cdd4", fill: "#ffffff" },
};

const darkToneColors: Record<FlowTone, { stroke: string; fill: string }> = {
  success: { stroke: "#3fbe87", fill: "#0d2a1c" },
  warning: { stroke: "#d99a3c", fill: "#2a2008" },
  danger: { stroke: "#e2645d", fill: "#2a0f0e" },
  neutral: { stroke: "#383f47", fill: "#14171b" },
};

function getColors(tone: FlowTone, isDark: boolean) {
  return isDark ? darkToneColors[tone] : toneColors[tone];
}

export const AgentNode = memo(function AgentNode({ x, y, label, sublabel, tone }: AgentNodeProps) {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const colors = getColors(tone, isDark);
  const name = label || "Agent";
  const displayName = name.length > 8 ? name.slice(0, 7) + "\u2026" : name;
  const fg = isDark ? "#e8eaed" : "#14171c";
  const fgSec = isDark ? "#a7adb6" : "#565c66";

  return (
    <g>
      <circle cx={x} cy={y} r={28} fill="none" stroke={colors.stroke} strokeWidth={1}
        opacity={tone === "neutral" ? 0 : 0.3} />
      <circle cx={x} cy={y} r={24} fill={colors.fill} stroke={colors.stroke} strokeWidth={1.5} />
      <circle cx={x} cy={y} r={20} fill="none" stroke={colors.stroke} strokeWidth={0.5} opacity={0.3} />
      <text x={x} y={y - 3} textAnchor="middle" fill={fg}
        fontSize={11} fontWeight={500} fontFamily="var(--font-sans, sans-serif)">
        {displayName}
      </text>
      <text x={x} y={y + 10} textAnchor="middle" fill={fgSec}
        fontSize={8} fontFamily="var(--font-mono, monospace)">
        {sublabel}
      </text>
    </g>
  );
});

AgentNode.displayName = "AgentNode";
