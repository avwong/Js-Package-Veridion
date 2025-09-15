/**
 * Open a centered popup window for KYC verification
 * @param url URL to open in the popup
 * @param windowName Optional window name
 * @returns Window instance or null if popup was blocked
 */
export declare function openKycPopup(url: string, windowName?: string): Window | null;
/**
 * Check if a popup window is still open and not closed by user
 * @param popup Popup window instance
 * @returns true if popup is still open, false otherwise
 */
export declare function isPopupOpen(popup: Window | null): boolean;
/**
 * Close a popup window
 * @param popup Popup window instance
 */
export declare function closePopup(popup: Window | null): void;
/**
 * Check if popups are likely to be blocked by the browser
 * @returns true if popups are likely blocked, false otherwise
 */
export declare function arePopupsBlocked(): boolean;
//# sourceMappingURL=popup.d.ts.map