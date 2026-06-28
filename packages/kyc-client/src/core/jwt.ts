/**
 * Parse the expiration timestamp from a JWT token.
 * Returns the `exp` claim (epoch seconds) or null if absent/malformed.
 * Never throws.
 */
export function parseTokenExpiry(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;

    // base64url → base64 → binary string → JSON
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(padded)) as Record<string, unknown>;

    const exp = json["exp"];
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}
