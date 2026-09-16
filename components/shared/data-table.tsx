"use client";

import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  emptyState?: ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  keyExtractor,
  emptyState,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return emptyState ?? null;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-left text-xs font-medium text-foreground-secondary ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={
                  onRowClick
                    ? "cursor-pointer transition-colors hover:bg-surface-raised"
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 ${col.className ?? ""}`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-2 sm:hidden">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={`surface space-y-1.5 p-3 ${
              onRowClick ? "cursor-pointer active:bg-surface-raised" : ""
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-baseline justify-between gap-2">
                <span className="shrink-0 text-xs text-foreground-muted">
                  {col.header}
                </span>
                <span className={`min-w-0 text-right text-xs ${col.className ?? ""}`}>
                  {col.render(item)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
