import type { KycStatus } from "../core/types.js";
/**
 * Error class for Edge API communication errors
 */
export declare class EdgeApiError extends Error {
    readonly status?: number | undefined;
    readonly response?: Response | undefined;
    constructor(message: string, status?: number | undefined, response?: Response | undefined);
}
/**
 * Check KYC status by calling the Edge API
 * @param edgeUrl Base URL of the Edge server
 * @param token Authentication token
 * @param clientId Client identifier
 * @param signal Optional abort signal for cancellation
 * @returns Promise resolving to KYC status
 */
export declare function checkKycStatus(edgeUrl: string, token: string, clientId: string, signal?: AbortSignal): Promise<KycStatus>;
/**
 * Future: Create a client session (not used in insecure mode)
 * @param edgeUrl Base URL of the Edge server
 * @param clientId Client identifier
 * @param publishableKey Publishable key for authentication
 * @returns Promise resolving to session data
 */
export declare function createClientSession(edgeUrl: string, clientId: string, publishableKey: string): Promise<{
    session_id: string;
    client_secret: string;
}>;
/**
 * Future: Create a session via integrator's backend (not used in insecure mode)
 * @param createSessionUrl Integrator's backend endpoint
 * @param clientId Client identifier
 * @returns Promise resolving to session data
 */
export declare function createIntegratorSession(createSessionUrl: string, clientId: string): Promise<{
    session_id: string;
    client_secret: string;
}>;
//# sourceMappingURL=edgeApi.d.ts.map