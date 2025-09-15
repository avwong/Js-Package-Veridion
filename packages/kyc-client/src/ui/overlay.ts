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
export function createKycOverlay(onClose?: () => void): Overlay {
  // Create backdrop element
  const backdrop = document.createElement("div");
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create modal container
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: relative;
    width: 90%;
    max-width: 800px;
    height: 90%;
    max-height: 600px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  `;

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    z-index: 10000;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  `;

  // Add hover effect to close button
  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.backgroundColor = "#f0f0f0";
  });
  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.backgroundColor = "transparent";
  });

  // Create iframe container
  const iframeContainer = document.createElement("div");
  iframeContainer.style.cssText = `
    width: 100%;
    height: 100%;
    position: relative;
  `;

  // Assemble modal
  modal.appendChild(closeButton);
  modal.appendChild(iframeContainer);
  backdrop.appendChild(modal);

  // Handle close events
  const close = () => {
    if (onClose) {
      onClose();
    }
    destroy();
  };

  const destroy = () => {
    if (backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
  };

  // Event listeners
  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", (event) => {
    // Close if clicking on backdrop (not modal content)
    if (event.target === backdrop) {
      close();
    }
  });

  // Prevent modal content clicks from bubbling to backdrop
  modal.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  // Handle escape key
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      close();
    }
  };
  document.addEventListener("keydown", handleKeyDown);

  // Clean up escape key listener on destroy
  const originalDestroy = destroy;
  const destroyWithCleanup = () => {
    document.removeEventListener("keydown", handleKeyDown);
    originalDestroy();
  };

  // Add to DOM
  document.body.appendChild(backdrop);

  // Focus the close button for accessibility
  closeButton.focus();

  return {
    mountIframe: (src: string) => {
      // Clear any existing iframe
      iframeContainer.innerHTML = "";

      // Create iframe
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;
      iframe.setAttribute("allow", "camera; microphone; geolocation");

      iframeContainer.appendChild(iframe);
    },
    destroy: destroyWithCleanup,
  };
}
