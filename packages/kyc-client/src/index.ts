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

import { KycClient } from "./client.js";

// Export all public types
export type {
  KycStatus,
  InitOptions,
  StartKycOptions,
  KycResult,
  EdgeMessage,
} from "./core/types.js";

// Create singleton instance
const kycClient = new KycClient();

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
export const init = (options: import("./core/types.js").InitOptions): void => {
  kycClient.init(options);
};

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
export const startKyc = (
  options?: import("./core/types.js").StartKycOptions
): Promise<import("./core/types.js").KycResult> => {
  return kycClient.startKyc(options);
};

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
export const requireKyc = (
  mode: "modal" | "reject" = "modal",
  openMode: "popup" | "iframe" = "iframe"
): Promise<boolean> => {
  return kycClient.requireKyc(mode, openMode);
};

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
export const checkStatus = (
  signal?: AbortSignal
): Promise<import("./core/types.js").KycStatus> => {
  return kycClient.checkStatus(signal);
};

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
export const loginIfVerified = (): Promise<boolean> => {
  return kycClient.loginIfVerified();
};

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
export const getToken = (): string | null => {
  return kycClient.getToken();
};

/**
 * Logout user (remove token and notify status change)
 *
 * @example
 * ```typescript
 * kyc.logout();
 * // User is now logged out and status is 'unknown'
 * ```
 */
export const logout = (): void => {
  kycClient.logout();
};

// Export default singleton with all methods
const kyc = {
  init,
  startKyc,
  requireKyc,
  checkStatus,
  loginIfVerified,
  getToken,
  logout,
};

export default kyc;
