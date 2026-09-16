const toneVar: Record<string, string> = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  info: "var(--color-info)",
  neutral: "var(--color-foreground-secondary)",
  danger: "var(--color-danger)",
};

const toneSubtle: Record<string, string> = {
  success: "var(--color-success-subtle)",
  warning: "var(--color-warning-subtle)",
  info: "var(--color-info-subtle)",
  neutral: "var(--color-border)",
  danger: "var(--color-danger-subtle)",
};

export function PolicyVisual() {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Agent Policy</span>
        <span className="status-badge" data-status="approved">Active</span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-foreground-secondary">Daily cap</span>
            <span className="data-mono text-xs text-foreground">$500.00</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-success" style={{ width: "62%" }} />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="data-mono text-[10px] text-foreground-muted">$310.00 spent</span>
            <span className="data-mono text-[10px] text-foreground-muted">62%</span>
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-foreground-secondary">Per-tx limit</span>
          <span className="data-mono text-xs text-foreground">$100.00</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-foreground-secondary">Escalation</span>
          <span className="data-mono text-xs text-foreground">$75.00</span>
        </div>
      </div>
    </div>
  );
}

export function ApprovalVisual() {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Pending Approvals</span>
        <span className="data-mono text-xs text-foreground-muted">2 queued</span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {[
          { agent: "0x1234…abcd", amount: "$85.00", fits: true },
          { agent: "0xabcd…5678", amount: "$60.00", fits: false },
        ].map((r) => (
          <div key={r.agent} className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <div className="data-mono text-xs text-foreground">{r.agent}</div>
              <div className="data-mono text-[10px] text-foreground-muted">{r.amount}</div>
            </div>
            <span
              className="status-badge"
              data-status={r.fits ? "approved" : "escalated"}
            >
              {r.fits ? "Fits" : "Would exceed"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettlementVisual() {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Settlement</span>
        <span className="status-badge" data-status="treasury">Non-custodial</span>
      </div>
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex w-full items-center justify-between rounded-md border border-border p-3">
          <div className="text-xs text-foreground-secondary">Agent wallet</div>
          <div className="data-mono text-xs text-foreground">$1,240.00</div>
        </div>
        <svg viewBox="0 0 16 16" className="h-4 w-4 text-foreground-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="8" y1="3" x2="8" y2="13" />
          <polyline points="5 10 8 13 11 10" />
        </svg>
        <div className="flex w-full items-center justify-between rounded-md border border-success p-3" style={{ backgroundColor: toneSubtle.success }}>
          <div className="text-xs text-foreground-secondary">Counterparty</div>
          <div className="data-mono text-xs" style={{ color: toneVar.success }}>$85.00</div>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-foreground-muted">
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <polyline points="2 6 5 9 10 3" />
          </svg>
          Atomic — reverts if transfer fails
        </div>
      </div>
    </div>
  );
}

export function AuditVisual() {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Audit Log</span>
        <span className="data-mono text-xs text-foreground-muted">47 entries today</span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {[
          { time: "14:32:08", agent: "0x1234", amount: "$85.00", decision: "approved", color: toneVar.success },
          { time: "14:28:41", agent: "0xabcd", amount: "$120.00", decision: "escalated", color: toneVar.warning },
          { time: "14:15:22", agent: "0x5678", amount: "$250.00", decision: "blocked", color: toneVar.danger },
          { time: "14:02:55", agent: "0x9abc", amount: "$45.00", decision: "approved", color: toneVar.success },
        ].map((entry, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md border border-border p-2.5">
            <span className="data-mono w-[52px] text-[10px] text-foreground-muted">{entry.time}</span>
            <span className="data-mono text-xs text-foreground">{entry.agent}</span>
            <span className="data-mono ml-auto text-xs text-foreground">{entry.amount}</span>
            <span className="text-[10px] font-medium" style={{ color: entry.color }}>{entry.decision}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonitoringVisual() {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">System Health</span>
        <span className="flex items-center gap-1.5 text-[10px] text-foreground-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: "Agents", value: "4", tone: "neutral" },
          { label: "Chain head", value: "#1,284,309", tone: "neutral" },
          { label: "Indexer lag", value: "2 blocks", tone: "success" },
          { label: "Near cap", value: "1 agent", tone: "warning" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-md border border-border p-3">
            <div className="text-[10px] text-foreground-muted">{stat.label}</div>
            <div className="data-mono mt-1 text-xs font-medium" style={{ color: toneVar[stat.tone] }}>{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground-muted">Payments today</span>
          <span className="data-mono text-xs text-foreground">$1,247.50</span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full" style={{ width: "48%", backgroundColor: toneVar.success }} />
        </div>
      </div>
    </div>
  );
}

export function EmergencyVisual() {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Emergency Controls</span>
        <span className="status-badge" data-status="blocked">Paused</span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <div className="rounded-md border border-danger p-3" style={{ backgroundColor: toneSubtle.danger }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Settlement</span>
            <span className="text-xs font-medium" style={{ color: toneVar.danger }}>Frozen</span>
          </div>
          <div className="mt-1 text-[10px] text-foreground-muted">No new payments will be settled</div>
        </div>
        <div className="rounded-md border border-success p-3" style={{ backgroundColor: toneSubtle.success }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Rejections</span>
            <span className="text-xs font-medium" style={{ color: toneVar.success }}>Active</span>
          </div>
          <div className="mt-1 text-[10px] text-foreground-muted">Approvers can still clear the queue</div>
        </div>
        <div className="rounded-md border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Policy reads</span>
            <span className="text-xs font-medium text-foreground-secondary">Active</span>
          </div>
          <div className="mt-1 text-[10px] text-foreground-muted">Visibility is maintained during pause</div>
        </div>
      </div>
    </div>
  );
}
