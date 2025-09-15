import type { EdgeStatusResponse, KycStatus } from "../core/types.js";

/**
 * Error class for Edge API communication errors
 */
export class EdgeApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: Response
  ) {
    super(message);
    this.name = "EdgeApiError";
  }
}

/**
 * Check KYC status by calling the Edge API
 * @param edgeUrl Base URL of the Edge server
 * @param token Authentication token
 * @param clientId Client identifier
 * @param signal Optional abort signal for cancellation
 * @returns Promise resolving to KYC status
 */
export async function checkKycStatus(
  edgeUrl: string,
  token: string,
  clientId: string,
  signal?: AbortSignal
): Promise<KycStatus> {
  try {
    const url = new URL("/status", edgeUrl);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ client_id: clientId }),
      signal: signal || null,
    });

    if (!response.ok) {
      throw new EdgeApiError(
        `Status check failed: ${response.status} ${response.statusText}`,
        response.status,
        response
      );
    }

    const data = (await response.json()) as EdgeStatusResponse;
    return data.status || "unknown";
  } catch (error) {
    if (error instanceof EdgeApiError) {
      throw error;
    }

    // Network errors, JSON parsing errors, etc.
    throw new EdgeApiError(
      `Failed to check KYC status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Future: Create a client session (not used in insecure mode)
 * @param edgeUrl Base URL of the Edge server
 * @param clientId Client identifier
 * @param publishableKey Publishable key for authentication
 * @returns Promise resolving to session data
 */
export async function createClientSession(
  edgeUrl: string,
  clientId: string,
  publishableKey: string
): Promise<{ session_id: string; client_secret: string }> {
  try {
    const url = new URL("/v1/client_tokens", edgeUrl);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publishableKey}`,
      },
      body: JSON.stringify({ client_id: clientId }),
    });

    if (!response.ok) {
      throw new EdgeApiError(
        `Session creation failed: ${response.status} ${response.statusText}`,
        response.status,
        response
      );
    }

    return (await response.json()) as {
      session_id: string;
      client_secret: string;
    };
  } catch (error) {
    if (error instanceof EdgeApiError) {
      throw error;
    }

    throw new EdgeApiError(
      `Failed to create session: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Future: Create a session via integrator's backend (not used in insecure mode)
 * @param createSessionUrl Integrator's backend endpoint
 * @param clientId Client identifier
 * @returns Promise resolving to session data
 */
export async function createIntegratorSession(
  createSessionUrl: string,
  clientId: string
): Promise<{ session_id: string; client_secret: string }> {
  try {
    const response = await fetch(createSessionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ client_id: clientId }),
    });

    if (!response.ok) {
      throw new EdgeApiError(
        `Integrator session creation failed: ${response.status} ${response.statusText}`,
        response.status,
        response
      );
    }

    return (await response.json()) as {
      session_id: string;
      client_secret: string;
    };
  } catch (error) {
    if (error instanceof EdgeApiError) {
      throw error;
    }

    throw new EdgeApiError(
      `Failed to create integrator session: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
