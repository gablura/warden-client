/**
 * Authentication configuration validation
 */

export function validateAuthConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Clerk configuration
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    errors.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set");
  }

  // API URL configuration
  if (!process.env.NEXT_PUBLIC_API_URL) {
    warnings.push("NEXT_PUBLIC_API_URL is not set, using default http://localhost:4000");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getAuthConfig() {
  return {
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  };
}
