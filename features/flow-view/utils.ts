import type { AgentSummary, FeedEvent, FlowTone } from "./types";
import { formatUsdc, shortenAddress } from "@/lib/format";

export interface FlowNode {
  address: string;
  x: number;
  y: number;
  label: string;
  sublabel: string;
  tone: FlowTone;
}

export interface FlowPulse {
  id: string;
  path: string;
  tone: Exclude<FlowTone, "neutral">;
}

/**
 * Positions up to 4 agent nodes in an arc above the policy gate (170,128).
 * Returns curved edge paths and animated payment pulses derived from
 * the most recent events.
 */
export function buildFlowLayout(agents: AgentSummary[], events: FeedEvent[]): { nodes: FlowNode[]; pulses: FlowPulse[] } {
  const MAX_NODES = 4;
  const CX = 170;
  const GATE_Y = 128;

  const nodes: FlowNode[] = agents.slice(0, MAX_NODES).map((agent, i) => {
    const angle = ((i - (Math.min(agents.length, MAX_NODES) - 1) / 2) * Math.PI) / 6;
    const x = CX + Math.sin(angle) * 120;
    const y = GATE_Y - 80 + Math.cos(angle) * 20;

    const lastEvent = events.find((e) => e.agent === agent.address);
    let tone: FlowTone = "neutral";
    if (lastEvent) {
      if (lastEvent.decision === "approved") tone = "success";
      else if (lastEvent.decision === "escalated") tone = "warning";
      else if (lastEvent.decision.startsWith("blocked")) tone = "danger";
    }

    return {
      address: agent.address,
      x,
      y,
      label: agent.label ?? shortenAddress(agent.address),
      sublabel: formatUsdc(agent.spentToday),
      tone,
    };
  });

  const pulses: FlowPulse[] = events
    .slice(0, 6)
    .map((event, i) => {
      const node = nodes.find((n) => n.address === event.agent);
      if (!node) return null;

      let tone: Exclude<FlowTone, "neutral"> = "success";
      if (event.decision === "escalated") tone = "warning";
      else if (event.decision.startsWith("blocked")) tone = "danger";

      return {
        id: `${event.agent}-${event.timestamp}-${i}`,
        path: `M${node.x},${node.y + 24} Q${(node.x + CX) / 2},${(node.y + GATE_Y) / 2} ${CX},${GATE_Y + 10}`,
        tone,
      };
    })
    .filter((p): p is FlowPulse => p !== null);

  return { nodes, pulses };
}

/**
 * Sums all agent spend into a single "moved today" value with a
 * human-readable label and a 0–1 fraction of an assumed $10k daily cap.
 */
export function computeVolumeReadout(agents: AgentSummary[]): { valueLabel: string; fraction: number } {
  let total = BigInt(0);
  for (const agent of agents) {
    try {
      total += BigInt(agent.spentToday || "0");
    } catch {
      // skip malformed values
    }
  }

  const DAILY_CAP_ASSUME = BigInt(10_000_000); // $10 in base units
  const fraction = total > BigInt(0) ? Number(total) / Number(DAILY_CAP_ASSUME) : 0;

  return {
    valueLabel: formatUsdc(total.toString()),
    fraction: Math.min(fraction, 1),
  };
}
