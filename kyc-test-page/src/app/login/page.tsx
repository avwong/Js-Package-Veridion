"use client";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { isLoading, error, connect } = useWallet();

  const handleConnect = async () => {
    // Log public envs for debugging (no secrets)
    console.log("RPC_URL", process.env.NEXT_PUBLIC_RPC_URL);
    console.log(
      "NETWORK_PASSPHRASE",
      process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE
    );
    console.log("WALLET_WASM_HASH", process.env.NEXT_PUBLIC_WALLET_WASM_HASH);
    console.log("LAUNCHTUBE_URL", process.env.NEXT_PUBLIC_LAUNCHTUBE_URL);
    console.log(
      "MERCURY_PROJECT_NAME",
      process.env.NEXT_PUBLIC_MERCURY_PROJECT_NAME
    );
    console.log("MERCURY_URL", process.env.NEXT_PUBLIC_MERCURY_URL);
    console.log(
      "NATIVE_CONTRACT_ID",
      process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ID
    );
    try {
      await connect();
    } catch {}
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-bold">Login with Passkey</h2>
        <div className="space-y-4">
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Connecting..." : "Connect"}
          </Button>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
