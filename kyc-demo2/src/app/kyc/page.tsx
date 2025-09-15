"use client";

import { useEffect, useState } from "react";

export default function KycMockPage() {
  const [status, setStatus] = useState<string>("idle");

  // Helper to post messages to opener (popup) or parent (iframe)
  const postToHost = (message: any) => {
    try {
      if (window.opener) {
        window.opener.postMessage(message, window.location.origin);
      } else if (window.parent) {
        window.parent.postMessage(message, window.location.origin);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to postMessage to host:", error);
    }
  };

  useEffect(() => {
    // Notify host that Edge app is ready
    postToHost({ type: "EDGE_READY" });
  }, []);

  const complete = (verified: boolean) => {
    const token = verified
      ? `mock_token_${Math.random().toString(36).slice(2)}`
      : "";
    const statusValue = verified ? "verified" : "pending";
    setStatus(statusValue);
    postToHost({ type: "EDGE_COMPLETE", token, status: statusValue });

    // If opened as popup, close after a short delay
    if (window.opener) {
      setTimeout(() => window.close(), 300);
    }
  };

  const cancel = () => {
    setStatus("cancelled");
    postToHost({ type: "EDGE_CANCEL" });
    if (window.opener) {
      setTimeout(() => window.close(), 300);
    }
  };

  const error = () => {
    setStatus("error");
    postToHost({ type: "EDGE_ERROR", error: "Mock error" });
  };

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7fafc",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
          color: "#111827",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Mock KYC</h1>
        <p style={{ marginTop: 8, color: "#6b7280" }}>
          This is a local mock of the Edge KYC app. Use the buttons below to
          simulate the flow.
        </p>

        <div
          style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}
        >
          <button
            onClick={() => complete(true)}
            style={{
              padding: "10px 16px",
              background: "#10b981",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ✅ Complete (verified)
          </button>

          <button
            onClick={() => complete(false)}
            style={{
              padding: "10px 16px",
              background: "#6366f1",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ⏳ Complete (pending)
          </button>

          <button
            onClick={cancel}
            style={{
              padding: "10px 16px",
              background: "#f59e0b",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ✖ Cancel
          </button>

          <button
            onClick={error}
            style={{
              padding: "10px 16px",
              background: "#ef4444",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ⚠ Error
          </button>
        </div>

        <div style={{ marginTop: 16, fontSize: 14, color: "#374151" }}>
          Status: <strong>{status}</strong>
        </div>
      </div>
    </div>
  );
}
