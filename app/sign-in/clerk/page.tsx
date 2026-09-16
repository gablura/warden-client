import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function ClerkSignInPage() {
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
            Sign in with your Google account to continue
          </p>
        </div>

        <SignIn
          // Land on the console after sign-in. fallbackRedirectUrl (not
          // force) keeps Clerk's ?redirect_url deep-link behavior intact:
          // a user bounced from /dashboard/audit comes straight back there
          // after authenticating. Every protected route is under /dashboard,
          // so both paths end in the console.
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full bg-surface shadow-sm border border-border rounded-xl p-8",
              header: "hidden",
              socialButtonsBlockButton:
                "w-full h-12 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-hover normal-case text-sm font-medium shadow-none transition-colors",
              socialButtonsBlockButtonText: "text-foreground font-medium",
              socialButtonsBlockButtonArrow: "text-foreground-muted",
              dividerLine: "bg-border",
              dividerText: "text-foreground-muted bg-surface",
              formFieldInput:
                "rounded-lg border border-border bg-background text-foreground h-12 text-sm",
              formFieldLabel: "text-xs font-medium text-foreground-secondary",
              formButtonPrimary:
                "bg-foreground text-background h-12 rounded-lg text-sm font-medium hover:opacity-90",
              formResendLink: "text-foreground-secondary",
              footer: "p-0",
              footerAction: "hidden",
              alertText: "text-danger",
              alert: "rounded-lg text-xs",
              formFieldErrorText: "text-danger text-xs",
              formFieldSuccessText: "text-success text-xs",
              socialButtonsProviderIcon: "w-5 h-5",
            },
          }}
        />

        <div className="mt-6 text-center">
          <Link href="/sign-in" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
            ← Back to sign-in options
          </Link>
        </div>
      </div>
    </div>
  );
}
