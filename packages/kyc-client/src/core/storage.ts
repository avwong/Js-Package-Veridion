import type { TokenStorage } from "./types.js";

/**
 * Safe localStorage wrapper that handles errors gracefully
 */
export class SafeTokenStorage implements TokenStorage {
  constructor(private readonly key: string) {}

  /**
   * Get token from localStorage
   * @returns Token string or null if not found/error
   */
  get(): string | null {
    try {
      return localStorage.getItem(this.key);
    } catch (error) {
      console.warn("[KYC Client] Failed to read from localStorage:", error);
      return null;
    }
  }

  /**
   * Store token in localStorage
   * @param token Token to store
   * @returns true if successful, false otherwise
   */
  set(token: string): boolean {
    try {
      localStorage.setItem(this.key, token);
      return true;
    } catch (error) {
      console.warn("[KYC Client] Failed to write to localStorage:", error);
      return false;
    }
  }

  /**
   * Remove token from localStorage
   * @returns true if successful, false otherwise
   */
  remove(): boolean {
    try {
      localStorage.removeItem(this.key);
      return true;
    } catch (error) {
      console.warn("[KYC Client] Failed to remove from localStorage:", error);
      return false;
    }
  }
}

/**
 * Create a safe token storage instance
 * @param key Storage key
 * @returns TokenStorage instance
 */
export function createTokenStorage(key: string): TokenStorage {
  return new SafeTokenStorage(key);
}
