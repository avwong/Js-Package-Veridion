/**
 * Interface for overlay management
 */
export interface Overlay {
    mountIframe: (src: string) => void;
    destroy: () => void;
}
/**
 * Create a modal overlay with iframe for KYC verification
 * @param onClose Callback when overlay is closed
 * @returns Overlay instance with mountIframe and destroy methods
 */
export declare function createKycOverlay(onClose?: () => void): Overlay;
//# sourceMappingURL=overlay.d.ts.map