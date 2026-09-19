"use client";

import { Toaster, toast } from "sonner";
import type { ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "rounded-md border bg-background px-3 py-2 text-xs",
            description: "text-foreground",
            actionButton: "btn btn-sm",
            cancelButton: "btn btn-ghost btn-sm",
          },
        }}
      />
    </>
  );
}

export { toast };