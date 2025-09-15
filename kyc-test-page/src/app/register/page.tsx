"use client";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const { isLoading, error, register } = useWallet();
  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-bold">Register with Passkey</h2>
        <div className="space-y-4">
          <Button onClick={() => register("My Wallet")} disabled={isLoading} className="w-full">
            {isLoading ? "Creating wallet..." : "Register Wallet"}
          </Button>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
}
