import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes and resolves conflicts. Use for all conditional class logic. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}