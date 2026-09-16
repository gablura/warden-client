import { ReadoutDial } from "@/components/ui/ReadoutDial";

interface ReadoutRowProps {
  volumeLabel: string;
  volumeFraction: number;
  pendingCount: number;
}

const PENDING_SCALE_MAX = 5;

export function ReadoutRow({ volumeLabel, volumeFraction, pendingCount }: ReadoutRowProps) {
  const pendingFraction = Math.min(pendingCount / PENDING_SCALE_MAX, 1);

  return (
    <div className="surface p-6">
      <div className="mb-4 text-center">
        <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
          Live Readouts
        </span>
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
        <ReadoutDial
          label="moved today"
          value={volumeLabel}
          fraction={volumeFraction}
          tone="success"
        />
        <div className="hidden h-20 w-px bg-border sm:block" />
        <ReadoutDial
          label="pending"
          value={String(pendingCount)}
          fraction={pendingFraction}
          tone="warning"
        />
      </div>
    </div>
  );
}
