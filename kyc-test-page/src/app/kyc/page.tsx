"use client";

import { useEffect, useState, useMemo } from "react";
import { useWalletStore } from "@/store/walletStore";
import {
  DynamicStepper,
  type StepperStep,
} from "@/components/kyc/DynamicStepper";
import { StepLogin } from "@/components/kyc/StepLogin";
import { StepConfirm } from "@/components/kyc/StepConfirm";

export default function KycPasskeyPage() {
  const [log, setLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { login, register, isLoading, setLoading, setError } = useWalletStore();

  const addLog = (m: string) => setLog((l) => [...l.slice(-9), m]);

  const postToHost = (message: any) => {
    try {
      const target = "*" as const;
      if (window.opener) {
        window.opener.postMessage(message, target);
      } else if (window.parent) {
        window.parent.postMessage(message, target);
      }
    } catch (e) {}
  };

  useEffect(() => {
    setMounted(true);
    postToHost({ type: "EDGE_READY" });
    addLog("EDGE_READY sent");
  }, []);

  const finishIfReady = (advance = false) => {
    const latest = useWalletStore.getState();
    if (latest.contractId) {
      if (advance) setCurrentStep(1);
      const token = `pk_${latest.contractId}`;
      postToHost({ type: "EDGE_COMPLETE", token, status: "verified" });
      if (window.opener) setTimeout(() => window.close(), 300);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      addLog("Prompting login with passkey...");
      await login();
      setLoading(false);
      addLog("Login successful");
      setCurrentStep(1);
      finishIfReady(false);
    } catch (e: any) {
      setLoading(false);
      setError(e?.message ?? "Passkey failed");
      addLog(`Passkey error: ${e?.message ?? e}`);
      postToHost({ type: "EDGE_ERROR", error: e?.message ?? "Passkey error" });
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      addLog("Registering wallet with passkey...");
      await register("KYC Wallet");
      setLoading(false);
      addLog("Registration successful");
      setCurrentStep(1);
      finishIfReady(false);
    } catch (e: any) {
      setLoading(false);
      setError(e?.message ?? "Registration failed");
      addLog(`Registration error: ${e?.message ?? e}`);
      postToHost({
        type: "EDGE_ERROR",
        error: e?.message ?? "Registration error",
      });
    }
  };

  const cancel = () => {
    postToHost({ type: "EDGE_CANCEL" });
    if (window.opener) setTimeout(() => window.close(), 300);
  };

  const steps: StepperStep[] = [
    {
      id: "login",
      title: "Login with Passkey",
      description: "Authenticate to continue or create a new wallet",
      content: (
        <StepLogin
          isLoading={isLoading}
          onLogin={handleLogin}
          onCancel={cancel}
          onRegister={handleRegister}
        />
      ),
    },
    {
      id: "confirm",
      title: "KYC Confirmation",
      description: "You can close this window to return to the app",
      content: <StepConfirm onClose={cancel} />,
    },
  ];

  const canProceed = useMemo(() => {
    return (idx: number) => {
      if (idx === 0) {
        return !!useWalletStore.getState().contractId;
      }
      return true;
    };
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">KYC + Passkey</h1>
          <p className="text-sm text-gray-600">
            Step 1: Login or Register with Passkey. Step 2: KYC completes and
            returns to host.
          </p>
        </div>

        {mounted && (
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <DynamicStepper
              steps={steps}
              onStepChange={() => {}}
              onComplete={() => {}}
              canProceed={(idx) => canProceed(idx)}
              current={currentStep}
              setCurrent={setCurrentStep}
            />
          </div>
        )}

        <div className="mt-4">
          <div className="text-xs text-gray-600 mb-2">Log</div>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-64 overflow-y-auto font-mono text-xs text-gray-800">
            {log.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
