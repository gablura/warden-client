"use client";

import { useMemo } from "react";
import { useLiveFeed } from "../hooks/useLiveFeed";
import { EventTicker } from "./EventTicker";
import { FlowGraph } from "./FlowGraph";
import { ReadoutRow } from "./ReadoutRow";
import { buildFlowLayout, computeVolumeReadout } from "../utils";
import type { AgentSummary, FeedEvent } from "../types";

interface FlowViewProps {
  initialAgents: AgentSummary[];
  initialEvents: FeedEvent[];
  initialPendingCount: number;
}

export function FlowView({ initialAgents, initialEvents, initialPendingCount }: FlowViewProps) {
  const { agents, events, pendingCount } = useLiveFeed({
    agents: initialAgents,
    events: initialEvents,
    pendingCount: initialPendingCount,
  });

  const { nodes, pulses } = useMemo(() => buildFlowLayout(agents, events), [agents, events]);
  const { valueLabel, fraction } = useMemo(() => computeVolumeReadout(agents), [agents]);

  return (
    <div className="space-y-4">
      {/* Live ticker */}
      <EventTicker events={events} />

      {/* Flow graph */}
      <FlowGraph nodes={nodes} pulses={pulses} pendingCount={pendingCount} />

      {/* Readout dials */}
      <ReadoutRow volumeLabel={valueLabel} volumeFraction={fraction} pendingCount={pendingCount} />
    </div>
  );
}
