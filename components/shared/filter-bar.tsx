"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FilterChip {
  key: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  chips?: FilterChip[];
  children?: React.ReactNode;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  chips = [],
  children,
}: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="input h-9 w-full pl-8 text-xs"
          />
          <svg
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" />
          </svg>
        </div>
      )}

      {/* Chips */}
      {chips.length > 0 && (
        <div className="hidden gap-1 sm:flex">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onClick}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                chip.selected
                  ? "bg-foreground text-foreground-inverse"
                  : "bg-surface text-foreground-secondary hover:bg-surface-raised"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Mobile filter toggle */}
      {chips.length > 0 && (
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn btn-ghost h-9 px-3 text-xs sm:hidden"
        >
          Filters
          {chips.some((c) => c.selected) && (
            <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-foreground-inverse">
              {chips.filter((c) => c.selected).length}
            </span>
          )}
        </button>
      )}

      {/* Mobile chips sheet */}
      {mobileOpen && chips.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:hidden">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onClick}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                chip.selected
                  ? "bg-foreground text-foreground-inverse"
                  : "bg-surface text-foreground-secondary hover:bg-surface-raised"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
