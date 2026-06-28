import type {
  InitOptions,
  StartKycOptions,
  KycResult,
  KycStatus,
  KycSession,
  EdgeMessage,
} from "./core/types.js";
import { createTokenStorage } from "./core/storage.js";
import { parseTokenExpiry } from "./core/jwt.js";
import { checkKycStatus, EdgeApiError } from "./transport/edgeApi.js";
import {
  openKycPopup,
  closePopup,
  isPopupOpen,
  arePopupsBlocked,
} from "./ui/popup.js";
import { createKycOverlay } from "./ui/overlay.js";

/**
 * Main KYC Client class
 */
export class KycClient {
  private edgeUrl = "";
  private clientId = "";
  private allowedOrigin = "";
  private storageKey = "kyc_token";
  private onStatusChange: ((status: KycStatus) => void) | undefined = undefined;
  private onTokenExpired: (() => void) | undefined = undefined;
  private insecureNoSession = false;

  // Future options (not used in insecure mode)
  private publishableKey: string | undefined = undefined;
  private createSessionUrl: string | undefined = undefined;
  private getClientToken:
    | (() => Promise<{ session_id: string; client_secret: string }>)
    | undefined = undefined;

  private tokenStorage = createTokenStorage(this.storageKey);
  private activeSession: KycSession | null = null;
  private messageHandler: ((event: MessageEvent) => void) | undefined =
    undefined;
  private expiryTimer: ReturnType<typeof setTimeout> | undefined = undefined;

  /**
   * Initialize the KYC client
   * @param options Configuration options
   */
  init(options: InitOptions): void {
    // Clear any expiry timer left from a previous init
    this.clearExpiryTimer();

    this.edgeUrl = options.edgeUrl;
    this.clientId = options.clientId;
    this.storageKey = options.storageKey || "kyc_token";
    this.allowedOrigin =
      options.allowedOrigin || new URL(options.edgeUrl).origin;
    this.onStatusChange = options.onStatusChange;
    this.onTokenExpired = options.onTokenExpired;
    this.insecureNoSession = options.insecureNoSession || false;

    // Future options
    this.publishableKey = options.publishableKey;
    this.createSessionUrl = options.createSessionUrl;
    this.getClientToken = options.getClientToken;

    // Create new token storage with the specified key
    this.tokenStorage = createTokenStorage(this.storageKey);

    // Register global message handler
    this.registerMessageHandler();

    // Schedule eviction timer for any token already in storage
    if (!this.insecureNoSession) {
      const existing = this.tokenStorage.get();
      if (existing !== null) {
        this.scheduleExpiryTimer(existing);
      }
    }
  }

  /**
   * Start KYC verification process
   * @param options Optional configuration for this verification attempt
   * @returns Promise resolving to verification result
   */
  async startKyc(options: StartKycOptions = {}): Promise<KycResult> {
    if (!this.edgeUrl || !this.clientId) {
      throw new Error("KYC client not initialized. Call init() first.");
    }

    if (this.activeSession) {
      throw new Error("KYC verification already in progress");
    }

    const openMode = options.openMode || "iframe";
    const insecure = options.insecure || this.insecureNoSession;

    return new Promise<KycResult>((resolve, reject) => {
      try {
        // Build KYC URL
        const kycUrl = this.buildKycUrl(options, insecure);

        // Create session tracking
        this.activeSession = {
          resolve,
          reject,
          closedWatcher: undefined,
          settled: false,
        };

        // Open UI based on mode
        if (openMode === "popup") {
          this.openPopupMode(kycUrl);
        } else {
          this.openIframeMode(kycUrl);
        }

        // Set up timeout for safety
        setTimeout(() => {
          if (this.activeSession && !this.activeSession.settled) {
            const resolver = this.activeSession.resolve;
            this.activeSession.settled = true;
            this.cleanupSession();
            resolve({ ok: false, error: "TIMEOUT" });
          }
        }, 10 * 60 * 1000); // 10 minutes timeout
      } catch (error) {
        this.cleanupSession();
        reject(error);
      }
    });
  }

  /**
   * Require KYC verification
   * @param mode How to handle if not verified: 'modal' (show KYC) or 'reject' (return false)
   * @param openMode How to open KYC interface
   * @returns Promise resolving to true if verified, false otherwise
   */
  async requireKyc(
    mode: "modal" | "reject" = "modal",
    openMode: "popup" | "iframe" = "iframe"
  ): Promise<boolean> {
    const status = await this.checkStatus();

    if (status === "verified") {
      return true;
    }

    if (mode === "reject") {
      return false;
    }

    const result = await this.startKyc({ openMode });
    return result.ok && result.status === "verified";
  }

  /**
   * Check current KYC status
   * @param signal Optional abort signal
   * @returns Promise resolving to current status
   */
  async checkStatus(signal?: AbortSignal): Promise<KycStatus> {
    const token = this.readValidToken();

    if (!token) {
      return "unknown";
    }

    try {
      const status = await checkKycStatus(
        this.edgeUrl,
        token,
        this.clientId,
        signal
      );

      // Notify status change
      if (this.onStatusChange) {
        this.onStatusChange(status);
      }

      return status;
    } catch (error) {
      console.warn("[KYC Client] Status check failed:", error);
      return "unknown";
    }
  }

  /**
   * Check if user is logged in and verified
   * @returns Promise resolving to true if verified, false otherwise
   */
  async loginIfVerified(): Promise<boolean> {
    return (await this.checkStatus()) === "verified";
  }

  /**
   * Get stored token
   * @returns Token string or null
   */
  getToken(): string | null {
    return this.readValidToken();
  }

  /**
   * Logout user (remove token and notify status change)
   */
  logout(): void {
    this.clearExpiryTimer();
    this.tokenStorage.remove();

    if (this.onStatusChange) {
      this.onStatusChange("unknown");
    }
  }

  /**
   * Build KYC URL with appropriate parameters
   */
  private buildKycUrl(options: StartKycOptions, insecure: boolean): string {
    const url = new URL("/kyc", this.edgeUrl);

    // Always include client_id
    url.searchParams.set("client_id", this.clientId);

    // Add insecure flag if needed
    if (insecure) {
      url.searchParams.set("insecure", "1");
    } else {
      // Future: Add session management here
      // For now, we only support insecure mode
      url.searchParams.set("insecure", "1");
    }

    // Add optional parameters
    if (options.locale) {
      url.searchParams.set("locale", options.locale);
    }
    if (options.theme) {
      url.searchParams.set("theme", options.theme);
    }
    if (options.loginHint) {
      url.searchParams.set("login_hint", options.loginHint);
    }

    return url.toString();
  }

  /**
   * Open KYC in popup mode
   */
  private openPopupMode(url: string): void {
    if (!this.activeSession) return;

    const popup = openKycPopup(url, "kyc-verification");

    if (!popup) {
      // Popup blocked, fallback to iframe
      console.warn("[KYC Client] Popup blocked, falling back to iframe");
      this.openIframeMode(url);
      return;
    }

    this.activeSession.window = popup;

    const checkClosed = setInterval(() => {
      if (!isPopupOpen(popup)) {
        clearInterval(checkClosed);
        if (this.activeSession) {
          this.activeSession.closedWatcher = undefined;
          // Grace period to allow EDGE_* message to arrive after window closes
          const currentSession = this.activeSession;
          setTimeout(() => {
            if (
              this.activeSession === currentSession &&
              !this.activeSession.settled
            ) {
              const resolver = this.activeSession.resolve;
              this.activeSession.settled = true;
              this.cleanupSession();
              resolver({ ok: false, error: "CANCELLED" });
            }
          }, 600);
        }
      }
    }, 300);
    this.activeSession.closedWatcher = checkClosed as unknown as number;
  }

  /**
   * Open KYC in iframe mode
   */
  private openIframeMode(url: string): void {
    if (!this.activeSession) return;

    const overlay = createKycOverlay(() => {
      if (this.activeSession && !this.activeSession.settled) {
        const resolver = this.activeSession.resolve;
        this.activeSession.settled = true;
        this.cleanupSession();
        resolver({ ok: false, error: "CANCELLED" });
      }
    });

    this.activeSession.overlay = overlay;
    overlay.mountIframe(url);
  }

  /**
   * Register global message handler for Edge App communication
   */
  private registerMessageHandler(): void {
    // Remove existing handler if any
    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
    }

    this.messageHandler = (event: MessageEvent) => {
      // Security: Only accept messages from allowed origin
      if (this.allowedOrigin !== "*" && event.origin !== this.allowedOrigin) {
        return;
      }

      // Parse message
      let message: EdgeMessage;
      try {
        message = event.data as EdgeMessage;
      } catch (error) {
        console.warn("[KYC Client] Invalid message format:", error);
        return;
      }

      // Handle different message types
      switch (message.type) {
        case "EDGE_READY":
          console.log("[KYC Client] Edge app is ready");
          break;

        case "EDGE_COMPLETE":
          this.handleKycComplete(message.token, message.status);
          break;

        case "EDGE_CANCEL":
          this.handleKycCancel();
          break;

        case "EDGE_ERROR":
          this.handleKycError(message.error);
          break;

        default:
          console.warn("[KYC Client] Unknown message type:", message);
      }
    };

    window.addEventListener("message", this.messageHandler, false);
  }

  /**
   * Handle KYC completion
   */
  private handleKycComplete(token: string, status: KycStatus): void {
    if (!this.activeSession || this.activeSession.settled) return;
    this.activeSession.settled = true;

    // Determine expiry before any side effects
    const expiresAt: number | undefined =
      !this.insecureNoSession && token
        ? (parseTokenExpiry(token) ?? undefined)
        : undefined;

    // Store token if provided
    if (token) {
      this.tokenStorage.set(token);
      if (!this.insecureNoSession) {
        this.scheduleExpiryTimer(token);
      }
    }

    // Notify status change
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }

    // Get resolver before cleanup
    const resolver = this.activeSession.resolve;

    // Clean up session
    this.cleanupSession();

    // Resolve with result
    if (expiresAt !== undefined) {
      resolver({ ok: true, status, token, expiresAt });
    } else {
      resolver({ ok: true, status, token });
    }
  }

  /**
   * Handle KYC cancellation
   */
  private handleKycCancel(): void {
    if (!this.activeSession || this.activeSession.settled) return;
    this.activeSession.settled = true;

    // Get resolver before cleanup
    const resolver = this.activeSession.resolve;

    // Clean up session
    this.cleanupSession();

    // Resolve with error
    resolver({ ok: false, error: "CANCELLED" });
  }

  /**
   * Handle KYC error
   */
  private handleKycError(error: string): void {
    if (!this.activeSession || this.activeSession.settled) return;
    this.activeSession.settled = true;

    // Get resolver before cleanup
    const resolver = this.activeSession.resolve;

    // Clean up session
    this.cleanupSession();

    // Resolve with error
    resolver({ ok: false, error });
  }

  /**
   * Clean up active session
   */
  private cleanupSession(): void {
    if (!this.activeSession) return;

    try {
      if (this.activeSession.closedWatcher !== undefined) {
        clearInterval(this.activeSession.closedWatcher);
        this.activeSession.closedWatcher = undefined;
      }
      // Close popup if open
      if (this.activeSession.window) {
        closePopup(this.activeSession.window);
      }

      // Destroy overlay if open
      if (this.activeSession.overlay) {
        this.activeSession.overlay.destroy();
      }
    } catch (error) {
      console.warn("[KYC Client] Error during cleanup:", error);
    } finally {
      this.activeSession = null;
    }
  }

  /**
   * Read the stored token, evicting it (and firing onTokenExpired) if expired.
   * Returns null when insecureNoSession is true and no token exists, or when
   * the token is absent or expired.
   */
  private readValidToken(): string | null {
    const token = this.tokenStorage.get();
    if (token === null) return null;

    if (this.insecureNoSession) return token;

    const exp = parseTokenExpiry(token);
    if (exp !== null && Date.now() / 1000 >= exp) {
      this.tokenStorage.remove();
      this.clearExpiryTimer();
      if (this.onTokenExpired) {
        this.onTokenExpired();
      }
      return null;
    }

    return token;
  }

  /**
   * Schedule a setTimeout that evicts the token exactly when it expires.
   * Clears any previously scheduled timer first to avoid duplicates.
   * If the token is already expired, evicts immediately.
   */
  private scheduleExpiryTimer(token: string): void {
    this.clearExpiryTimer();

    const exp = parseTokenExpiry(token);
    if (exp === null) return;

    const msUntilExpiry = exp * 1000 - Date.now();

    if (msUntilExpiry <= 0) {
      this.tokenStorage.remove();
      if (this.onTokenExpired) {
        this.onTokenExpired();
      }
      return;
    }

    this.expiryTimer = setTimeout(() => {
      this.expiryTimer = undefined;
      this.tokenStorage.remove();
      if (this.onTokenExpired) {
        this.onTokenExpired();
      }
    }, msUntilExpiry);
  }

  /** Cancel any pending expiry timer. */
  private clearExpiryTimer(): void {
    if (this.expiryTimer !== undefined) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.cleanupSession();
    this.clearExpiryTimer();

    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
      this.messageHandler = undefined;
    }
  }
}
