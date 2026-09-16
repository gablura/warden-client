"use client";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { useState, useSyncExternalStore } from "react";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const toggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button disabled className="btn btn-ghost h-8 w-8 p-0" aria-label="Toggle theme">
        <span className="text-sm">&nbsp;</span>
      </button>
    );
  }

  // Single button: shows current theme icon, toggles on click
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      className={cn(
        "btn btn-ghost h-8 w-8 p-0",
        "text-foreground-secondary hover:text-foreground"
      )}
      title={isDark ? "Switch to light" : "Switch to dark"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="text-sm">{isDark ? "\u263E" : "\u2600"}</span>
    </button>
  );
}
