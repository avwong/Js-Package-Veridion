import { useWalletStore } from "@/store/walletStore";

export function useWallet() {
  const { keyId, contractId, isLoading, error, connect, register, disconnect, setLoading, setError } = useWalletStore();
  return { keyId, contractId, isLoading, error, connect, register, disconnect, setLoading, setError };
}
