"use client";
import React from "react";

export function Stepper({ current }: { current: number }) {
  const steps = [
    { index: 1, label: "Login with Passkey" },
    { index: 2, label: "KYC Confirmation" },
  ];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {steps.map((s) => {
        const active = current === s.index;
        const done = current > s.index;
        return (
          <div key={s.index} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: done ? "#10b981" : active ? "#3b82f6" : "#e5e7eb",
                color: done || active ? "#fff" : "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {s.index}
            </div>
            <div style={{ fontWeight: active ? 700 : 500, color: done ? "#10b981" : "#111827" }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}
