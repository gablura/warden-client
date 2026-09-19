import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@/components/clerk-provider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { QueryProvider } from "@/components/query-provider";
import { ToastProvider } from "@/features/toast/ToastProvider";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Warden - AI Agent Governance & Payment Control",
    template: "%s | Warden",
  },
  description: "Warden provides governance and visibility for AI agents that spend money autonomously. Enforce spend limits, require approvals, and maintain audit trails for agent payments on Arc blockchain.",
  keywords: ["AI agents", "blockchain governance", "payment control", "Arc blockchain", "agent spending", "audit trail", "spend limits"],
  authors: [{ name: "Warden Team" }],
  creator: "Warden",
  publisher: "Warden",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://warden.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://warden.dev",
    siteName: "Warden",
    title: "Warden - AI Agent Governance & Payment Control",
    description: "Governance and visibility layer for AI agents that spend money autonomously on Arc blockchain",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Warden - AI Agent Governance Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Warden - AI Agent Governance & Payment Control",
    description: "Governance and visibility layer for AI agents that spend money autonomously on Arc blockchain",
    images: ["/og-image.png"],
    creator: "@warden_dev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem("warden-theme");
    if (t === "light" || t === "dark") {
      document.documentElement.classList.add(t);
    } else {
      var d = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.add(d ? "dark" : "light");
    }
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <AuthProvider>
            <QueryProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </QueryProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
