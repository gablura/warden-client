"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Mode = "google" | "apikey";

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("google");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithApiKey, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const handleGoogleSignIn = () => {
    // Navigate to Clerk's built-in sign-in page
    router.push("/sign-in/clerk");
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError("Please enter your API key");
      return;
    }
    setLoading(true);
    const result = await signInWithApiKey(trimmed);
    setLoading(false);
    if (result.ok) {
      router.replace("/dashboard");
    } else {
      setError(result.error ?? "Sign in failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border-strong bg-surface text-lg font-bold text-foreground">
            W
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-success" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to Warden
          </h1>
          <p className="mt-2 text-center text-sm text-foreground-secondary">
            {mode === "google"
              ? "Sign in with your Google account to continue"
              : "Enter your API key to access the dashboard"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          {/* Error Display */}
          {error && (
            <div className="mb-6 rounded-lg border border-danger p-4 text-sm" style={{ backgroundColor: "var(--color-danger-subtle)", color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          {/* Google Mode */}
          {mode === "google" && (
            <div className="flex flex-col gap-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-3 text-foreground-muted">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setMode("apikey"); setError(""); }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 7h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h6" />
                  <path d="M9 12l3 3 3-3" />
                  <path d="M12 3v12" />
                </svg>
                API Key
              </button>
            </div>
          )}

          {/* API Key Mode */}
          {mode === "apikey" && (
            <form onSubmit={handleApiKeySubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="api-key" className="mb-2 block text-sm font-medium text-foreground">
                  API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="role:label:your-api-key"
                  className="input w-full h-12 text-sm"
                  autoComplete="off"
                  autoFocus
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-foreground-muted">
                  Format: role:label:key — ask your admin for credentials
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !apiKey.trim()}
                className="btn btn-primary h-12 w-full text-sm font-medium"
              >
                {loading ? "Verifying..." : "Sign In with API Key"}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-3 text-foreground-muted">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setMode("google"); setError(""); }}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
