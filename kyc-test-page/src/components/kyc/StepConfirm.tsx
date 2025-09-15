"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export function StepConfirm({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button onClick={onClose} variant="outline">Close</Button>
    </div>
  );
}
