/**
 * Open a centered popup window for KYC verification
 * @param url URL to open in the popup
 * @param windowName Optional window name
 * @returns Window instance or null if popup was blocked
 */
export function openKycPopup(url: string, windowName?: string): Window | null {
  // Calculate center position for popup
  const width = 800;
  const height = 600;
  const left = Math.round((screen.width - width) / 2);
  const top = Math.round((screen.height - height) / 2);

  // Build feature string for popup
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    "scrollbars=yes",
    "resizable=yes",
    "toolbar=no",
    "menubar=no",
    "location=no",
    "status=no",
  ].join(",");

  try {
    const popup = window.open(url, windowName || "kyc-verification", features);

    if (!popup) {
      console.warn("[KYC Client] Popup was blocked by browser");
      return null;
    }

    // Focus the popup
    popup.focus();

    return popup;
  } catch (error) {
    console.error("[KYC Client] Failed to open popup:", error);
    return null;
  }
}

/**
 * Check if a popup window is still open and not closed by user
 * @param popup Popup window instance
 * @returns true if popup is still open, false otherwise
 */
export function isPopupOpen(popup: Window | null): boolean {
  if (!popup) {
    return false;
  }

  try {
    // Check if window is closed
    return !popup.closed;
  } catch (error) {
    // If we can't access the window (cross-origin), assume it's closed
    return false;
  }
}

/**
 * Close a popup window
 * @param popup Popup window instance
 */
export function closePopup(popup: Window | null): void {
  if (!popup) {
    return;
  }

  try {
    popup.close();
  } catch (error) {
    console.warn("[KYC Client] Failed to close popup:", error);
  }
}

/**
 * Check if popups are likely to be blocked by the browser
 * @returns true if popups are likely blocked, false otherwise
 */
export function arePopupsBlocked(): boolean {
  try {
    // Try to open a test popup
    const testPopup = window.open(
      "about:blank",
      "test-popup",
      "width=1,height=1"
    );

    if (!testPopup) {
      return true;
    }

    // Close the test popup immediately
    testPopup.close();
    return false;
  } catch (error) {
    return true;
  }
}
