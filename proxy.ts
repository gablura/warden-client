import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes — no auth required
const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/about",
  "/sign-in(.*)",
  "/sign-in/clerk(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api(.*)",
]);

// Protected routes — require authentication.
//
// Everything authenticated lives under the /dashboard namespace, so one
// matcher covers it fail-safe: a future console page added under /dashboard
// is protected automatically instead of depending on this list being
// extended in lockstep (the per-page router.replace("/sign-in") checks are
// UX, not security).
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
