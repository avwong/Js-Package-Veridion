/**
 * KYC verification status
 */
export type KycStatus = "unknown" | "pending" | "verified" | "rejected";
/**
 * Options for initializing the KYC client
 */
export interface InitOptions {
    /** Edge server URL (e.g., https://edge.example.com) */
    edgeUrl: string;
    /** Integrator's application ID */
    clientId: string;
    /** Storage key for token (default: 'kyc_token') */
    storageKey?: string;
    /** Allowed origin for postMessage filtering (defaults to edgeUrl origin) */
    allowedOrigin?: string;
    /** Callback for status changes */
    onStatusChange?: (status: KycStatus) => void;
    /** Client-side publishable key (pk_...) */
    publishableKey?: string;
    /** Integrator's backend endpoint for session creation */
    createSessionUrl?: string;
    /** Function to get client token from integrator's backend */
    getClientToken?: () => Promise<{
        session_id: string;
        client_secret: string;
    }>;
    /**
     * *** HACKATHON ONLY ***
     * If true, we DO NOT call any session/token endpoint; we just open /kyc
     * This bypasses all authentication and session management
     */
    insecureNoSession?: boolean;
}
/**
 * Options for starting KYC verification
 */
export interface StartKycOptions {
    /** Locale for the KYC interface */
    locale?: string;
    /** Theme preference */
    theme?: "light" | "dark" | "auto";
    /** Login hint for pre-filling user information */
    loginHint?: string;
    /** How to open the KYC interface */
    openMode?: "iframe" | "popup";
    /** Force no-session mode just for this call */
    insecure?: boolean;
}
/**
 * Result of KYC verification attempt
 */
export type KycResult = {
    ok: true;
    status: KycStatus;
    token?: string;
} | {
    ok: false;
    error: string;
};
/**
 * Messages sent from the Edge App via postMessage
 */
export type EdgeMessage = {
    type: "EDGE_READY";
} | {
    type: "EDGE_COMPLETE";
    token: string;
    status: KycStatus;
} | {
    type: "EDGE_CANCEL";
} | {
    type: "EDGE_ERROR";
    error: string;
};
/**
 * Internal state for tracking active KYC sessions
 */
export interface KycSession {
    resolve: (result: KycResult) => void;
    reject: (error: Error) => void;
    window?: Window;
    overlay?: {
        mountIframe: (src: string) => void;
        destroy: () => void;
    };
    /** Interval id for popup close watcher */
    closedWatcher: number | undefined;
    /** Set to true once a terminal result has been sent */
    settled?: boolean;
}
/**
 * Storage interface for token management
 */
export interface TokenStorage {
    get(): string | null;
    set(token: string): boolean;
    remove(): boolean;
}
/**
 * Edge API response for status check
 */
export interface EdgeStatusResponse {
    status: KycStatus;
    verified: boolean;
}
//# sourceMappingURL=types.d.ts.map