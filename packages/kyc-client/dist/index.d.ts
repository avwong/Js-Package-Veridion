/**
 * @oppia/kyc-client
 *
 * Frontend-only KYC client library for Edge App integration.
 *
 * This library provides a simple interface for integrating KYC verification
 * into web applications. It supports both popup and iframe modes, handles
 * secure communication via postMessage, and includes an "insecure no-session"
 * mode for hackathon/demo purposes.
 *
 * @example
 * ```typescript
 * import kyc from '@oppia/kyc-client';
 *
 * kyc.init({
 *   edgeUrl: 'http://localhost:4000',
 *   clientId: 'meridian-demo',
 *   insecureNoSession: true, // hackathon mode
 *   onStatusChange: (status) => console.log('KYC status:', status),
 * });
 *
 * // Start verification in popup
 * const result = await kyc.startKyc({ openMode: 'popup' });
 * if (result.ok && result.status === 'verified') {
 *   console.log('✅ Verified! Token:', result.token);
 * }
 * ```
 */
export type { KycStatus, InitOptions, StartKycOptions, KycResult, EdgeMessage, } from "./core/types.js";
/**
 * Initialize the KYC client with configuration options
 *
 * @param options - Configuration options for the KYC client
 *
 * @example
 * ```typescript
 * kyc.init({
 *   edgeUrl: 'https://edge.example.com',
 *   clientId: 'my-app',
 *   insecureNoSession: true,
 *   onStatusChange: (status) => {
 *     console.log('KYC status changed to:', status);
 *   }
 * });
 * ```
 */
export declare const init: (options: import("./core/types.js").InitOptions) => void;
/**
 * Start KYC verification process
 *
 * @param options - Optional configuration for this verification attempt
 * @returns Promise that resolves to verification result
 *
 * @example
 * ```typescript
 * // Popup mode (recommended for user-initiated actions)
 * const result = await kyc.startKyc({ openMode: 'popup' });
 *
 * // Iframe mode (for embedded flows)
 * const result = await kyc.startKyc({ openMode: 'iframe' });
 *
 * if (result.ok && result.status === 'verified') {
 *   console.log('User is verified!');
 * }
 * ```
 */
export declare const startKyc: (options?: import("./core/types.js").StartKycOptions) => Promise<import("./core/types.js").KycResult>;
/**
 * Require KYC verification
 *
 * If the user is already verified, returns true immediately.
 * Otherwise, either shows the KYC interface or returns false based on mode.
 *
 * @param mode - How to handle if not verified: 'modal' (show KYC) or 'reject' (return false)
 * @param openMode - How to open KYC interface if needed
 * @returns Promise resolving to true if verified, false otherwise
 *
 * @example
 * ```typescript
 * // Show KYC modal if not verified
 * const isVerified = await kyc.requireKyc('modal');
 *
 * // Just check without showing UI
 * const isVerified = await kyc.requireKyc('reject');
 * ```
 */
export declare const requireKyc: (mode?: "modal" | "reject", openMode?: "popup" | "iframe") => Promise<boolean>;
/**
 * Check current KYC status
 *
 * @param signal - Optional abort signal for cancellation
 * @returns Promise resolving to current status
 *
 * @example
 * ```typescript
 * const status = await kyc.checkStatus();
 * console.log('Current KYC status:', status);
 * ```
 */
export declare const checkStatus: (signal?: AbortSignal) => Promise<import("./core/types.js").KycStatus>;
/**
 * Check if user is logged in and verified
 *
 * @returns Promise resolving to true if verified, false otherwise
 *
 * @example
 * ```typescript
 * const isLoggedIn = await kyc.loginIfVerified();
 * if (isLoggedIn) {
 *   // User is verified and logged in
 * }
 * ```
 */
export declare const loginIfVerified: () => Promise<boolean>;
/**
 * Get stored authentication token
 *
 * @returns Token string or null if not available
 *
 * @example
 * ```typescript
 * const token = kyc.getToken();
 * if (token) {
 *   // Use token for API calls
 * }
 * ```
 */
export declare const getToken: () => string | null;
/**
 * Logout user (remove token and notify status change)
 *
 * @example
 * ```typescript
 * kyc.logout();
 * // User is now logged out and status is 'unknown'
 * ```
 */
export declare const logout: () => void;
declare const kyc: {
    init: (options: import("./core/types.js").InitOptions) => void;
    startKyc: (options?: import("./core/types.js").StartKycOptions) => Promise<import("./core/types.js").KycResult>;
    requireKyc: (mode?: "modal" | "reject", openMode?: "popup" | "iframe") => Promise<boolean>;
    checkStatus: (signal?: AbortSignal) => Promise<import("./core/types.js").KycStatus>;
    loginIfVerified: () => Promise<boolean>;
    getToken: () => string | null;
    logout: () => void;
};
export default kyc;
//# sourceMappingURL=index.d.ts.map