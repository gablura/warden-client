// Shared between proxy.ts (middleware, server-side) and AuthProvider.tsx
// (client-side) so the cookie name can never drift between the two.
//
// Why this cookie exists: the dashboard has two auth paths. Clerk (Google)
// sessions are visible to the middleware and enforced with auth.protect().
// API keys live in localStorage, which server-side middleware cannot read —
// without a middleware-visible signal, an API-key login redirecting to
// /dashboard is bounced straight back to /sign-in by auth.protect(), and
// /sign-in (seeing the stored key) redirects right back: a redirect loop.
// Sign-in therefore drops this first-party hint cookie; the middleware lets
// requests through when EITHER a Clerk session OR this cookie is present.
//
// The cookie gates nothing sensitive: it is not a credential, it is never
// sent to the Warden backend, and every data call verifies the real key
// server-side. A forged or stale cookie at most renders the dashboard
// shell with failing data calls before the page's own useAuth gate
// redirects to /sign-in.
export const API_KEY_SESSION_COOKIE = "warden_api_session";

/// Refreshed on every AuthProvider mount while an API key is held, so the
/// hint outlives casual browser-cookie clearing about as long as the
/// session itself.
export const API_KEY_SESSION_MAX_AGE_S = 60 * 60 * 24 * 30;

/// Client-side only (document.cookie). Marks an active API-key session for
/// the middleware.
export function markApiKeySession(): void {
  document.cookie = `${API_KEY_SESSION_COOKIE}=1; path=/; max-age=${API_KEY_SESSION_MAX_AGE_S}; samesite=lax`;
}

/// Client-side only. Clears the hint (used on sign-out and when a Clerk
/// session supersedes an API-key one).
export function clearApiKeySession(): void {
  document.cookie = `${API_KEY_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}