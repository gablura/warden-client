export function LiveIndicator({ connected }: { connected: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-foreground-muted">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          connected ? "bg-success" : "bg-foreground-muted"
        }`}
      />
      {connected ? "live" : "offline"}
    </span>
  );
}
