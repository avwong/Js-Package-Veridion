import type { TokenStorage } from "./types.js";
/**
 * Safe localStorage wrapper that handles errors gracefully
 */
export declare class SafeTokenStorage implements TokenStorage {
    private readonly key;
    constructor(key: string);
    /**
     * Get token from localStorage
     * @returns Token string or null if not found/error
     */
    get(): string | null;
    /**
     * Store token in localStorage
     * @param token Token to store
     * @returns true if successful, false otherwise
     */
    set(token: string): boolean;
    /**
     * Remove token from localStorage
     * @returns true if successful, false otherwise
     */
    remove(): boolean;
}
/**
 * Create a safe token storage instance
 * @param key Storage key
 * @returns TokenStorage instance
 */
export declare function createTokenStorage(key: string): TokenStorage;
//# sourceMappingURL=storage.d.ts.map