import type { InitOptions, StartKycOptions, KycResult, KycStatus } from "./core/types.js";
/**
 * Main KYC Client class
 */
export declare class KycClient {
    private edgeUrl;
    private clientId;
    private allowedOrigin;
    private storageKey;
    private onStatusChange;
    private onTokenExpired;
    private insecureNoSession;
    private publishableKey;
    private createSessionUrl;
    private getClientToken;
    private tokenStorage;
    private activeSession;
    private messageHandler;
    private expiryTimer;
    /**
     * Initialize the KYC client
     * @param options Configuration options
     */
    init(options: InitOptions): void;
    /**
     * Start KYC verification process
     * @param options Optional configuration for this verification attempt
     * @returns Promise resolving to verification result
     */
    startKyc(options?: StartKycOptions): Promise<KycResult>;
    /**
     * Require KYC verification
     * @param mode How to handle if not verified: 'modal' (show KYC) or 'reject' (return false)
     * @param openMode How to open KYC interface
     * @returns Promise resolving to true if verified, false otherwise
     */
    requireKyc(mode?: "modal" | "reject", openMode?: "popup" | "iframe"): Promise<boolean>;
    /**
     * Check current KYC status
     * @param signal Optional abort signal
     * @returns Promise resolving to current status
     */
    checkStatus(signal?: AbortSignal): Promise<KycStatus>;
    /**
     * Check if user is logged in and verified
     * @returns Promise resolving to true if verified, false otherwise
     */
    loginIfVerified(): Promise<boolean>;
    /**
     * Get stored token
     * @returns Token string or null
     */
    getToken(): string | null;
    /**
     * Logout user (remove token and notify status change)
     */
    logout(): void;
    /**
     * Build KYC URL with appropriate parameters
     */
    private buildKycUrl;
    /**
     * Open KYC in popup mode
     */
    private openPopupMode;
    /**
     * Open KYC in iframe mode
     */
    private openIframeMode;
    /**
     * Register global message handler for Edge App communication
     */
    private registerMessageHandler;
    /**
     * Handle KYC completion
     */
    private handleKycComplete;
    /**
     * Handle KYC cancellation
     */
    private handleKycCancel;
    /**
     * Handle KYC error
     */
    private handleKycError;
    /**
     * Clean up active session
     */
    private cleanupSession;
    /**
     * Read the stored token, evicting it (and firing onTokenExpired) if expired.
     * Returns null when insecureNoSession is true and no token exists, or when
     * the token is absent or expired.
     */
    private readValidToken;
    /**
     * Schedule a setTimeout that evicts the token exactly when it expires.
     * Clears any previously scheduled timer first to avoid duplicates.
     * If the token is already expired, evicts immediately.
     */
    private scheduleExpiryTimer;
    /** Cancel any pending expiry timer. */
    private clearExpiryTimer;
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=client.d.ts.map