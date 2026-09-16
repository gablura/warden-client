import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Console pages moved under the /dashboard namespace so proxy.ts can
      // protect them with a single fail-safe matcher. Temporary (307) on
      // purpose: no long-lived browser caches pinning the old structure.
      { source: "/agents", destination: "/dashboard/agents", permanent: false },
      { source: "/approvals", destination: "/dashboard/approvals", permanent: false },
      { source: "/audit", destination: "/dashboard/audit", permanent: false },
    ];
  },
};

export default nextConfig;
