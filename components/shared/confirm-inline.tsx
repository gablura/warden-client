"use client";

import { useCallback, useEffect, useState } from "react";

interface ConfirmInlineProps {
  children: (props: { confirming: boolean; onClick: () => void }) => React.ReactNode;
  onConfirm: () => void;
  delayMs?: number;
}

export function ConfirmInline({ children, onConfirm, delayMs = 2500 }: ConfirmInlineProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), delayMs);
    return () => clearTimeout(id);
  }, [confirming, delayMs]);

  const onClick = useCallback(() => {
    if (confirming) {
      setConfirming(false);
      onConfirm();
    } else {
      setConfirming(true);
    }
  }, [confirming, onConfirm]);

  return <>{children({ confirming, onClick })}</>;
}
