/** USDC base units (6 decimals) → a formatted dollar string. */
export function formatUsdc(raw: string | number | bigint | undefined): string {
  const value = typeof raw === "bigint" ? raw : BigInt(raw ?? 0);
  const dollars = Number(value) / 1_000_000;
  return dollars.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

/** 0x1234...abcd — for anywhere an address needs to fit in a small space. */
export function shortenAddress(address: string): string {
  return address.length > 10 ? `${address.slice(0, 6)}\u2026${address.slice(-4)}` : address;
}

/** ISO timestamp → relative time string ("2m ago", "1h ago", "3d ago"). */
export function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}