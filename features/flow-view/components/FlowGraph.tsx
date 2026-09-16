import { AgentNode } from "./AgentNode";
import { PaymentPulse } from "./PaymentPulse";
import type { FlowNode, FlowPulse } from "../utils";

interface FlowGraphProps {
  nodes: FlowNode[];
  pulses: FlowPulse[];
  pendingCount: number;
}

export function FlowGraph({ nodes, pulses, pendingCount }: FlowGraphProps) {
  return (
    <div className="surface relative overflow-hidden p-4 sm:p-6">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <svg viewBox="0 0 400 300" className="relative h-auto w-full" role="img" aria-label="Live agent payment flow">
        <title>Live agent payment flow</title>
        <desc>Agents send USDC payments through a policy gate to the treasury; each node shows its most recent decision.</desc>

        <defs>
          {/* Gradient for edges */}
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-border-strong)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-border-strong)" stopOpacity={0.8} />
          </linearGradient>

          {/* Glow filter for pulses */}
          <filter id="pulse-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle glow for active nodes */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges from agents to policy gate */}
        {nodes.map((node) => (
          <path
            key={`edge-${node.address}`}
            d={`M${node.x},${node.y + 28} C${node.x},${(node.y + 130) / 2} ${200},110 200,135`}
            fill="none"
            stroke="url(#edge-gradient)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        ))}

        {/* Edge from policy gate to treasury */}
        <path
          d="M200,166 L200,205"
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth={2}
          strokeDasharray="6 4"
        />

        {/* Animated pulses */}
        <g filter="url(#pulse-glow)">
          {pulses.map((pulse) => (
            <PaymentPulse key={pulse.id} path={pulse.path} tone={pulse.tone} />
          ))}
        </g>

        {/* Agent nodes */}
        <g filter="url(#node-glow)">
          {nodes.map((node) => (
            <AgentNode
              key={node.address}
              x={node.x}
              y={node.y}
              label={node.label}
              sublabel={node.sublabel}
              tone={node.tone}
            />
          ))}
        </g>

        {/* Policy gate */}
        <g>
          <rect
            x={158}
            y={118}
            width={84}
            height={48}
            rx={10}
            fill="var(--color-warning-subtle)"
            stroke="var(--color-warning)"
            strokeWidth={1.5}
          />
          {/* Shield icon — centered above text */}
          <path
            d="M200,124 L196,126 L196,130 C196,132.5 198,134 200,134.5 C202,134 204,132.5 204,130 L204,126 Z"
            fill="none"
            stroke="var(--color-warning)"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <text x={200} y={146} textAnchor="middle" className="fill-warning text-[9px] font-semibold" letterSpacing="0.03em">
            POLICY GATE
          </text>
          <text x={200} y={157} textAnchor="middle" className="fill-warning text-[8px]">
            {pendingCount} pending
          </text>
        </g>

        {/* Treasury */}
        <g>
          <circle cx={200} cy={235} r={30} fill="var(--color-info-subtle)" stroke="var(--color-info)" strokeWidth={1.5} />
          {/* Vault icon — centered above text */}
          <rect x={195} y={222} width={10} height={8} rx={1.5} fill="none" stroke="var(--color-info)" strokeWidth={1} />
          <circle cx={200} cy={226} r={1.5} fill="var(--color-info)" />
          <text x={200} y={240} textAnchor="middle" className="fill-info text-[9px] font-semibold" letterSpacing="0.03em">
            TREASURY
          </text>
          <text x={200} y={250} textAnchor="middle" className="fill-info text-[8px]">
            USDC
          </text>
        </g>

        {/* Flow direction arrows */}
        <g className="fill-foreground-muted" opacity={0.4}>
          <polygon points="200,110 196,104 204,104" />
          <polygon points="200,198 196,192 204,192" />
        </g>
      </svg>
    </div>
  );
}
