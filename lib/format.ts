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