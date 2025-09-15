import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import base64url from "base64url";
import { toast } from "sonner";

export interface WalletState {
  keyId: string | null;
  contractId: string | null;
  isLoading: boolean;
  error: string | null;
}
export interface WalletActions {
  setKeyId: (keyId: string) => void;
  setContractId: (contractId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** Always attempts login first; falls back to register on not-found */
  login: () => Promise<void>;
  /** Deprecated: kept for API parity, calls login() unless a keyId is explicitly provided */
  connect: (keyId?: string) => Promise<void>;
  register: (name: string) => Promise<void>;
  disconnect: () => void;
}
export type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      keyId: null,
      contractId: null,
      isLoading: false,
      error: null,

      setKeyId: (keyId) => set({ keyId }),
      setContractId: (contractId) => set({ contractId }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async () => {
        set({ isLoading: true, error: null });
        try {
          const { account, server } = await import("../lib/passkey");

          // Force user presence: always call connectWallet (WebAuthn prompt)
          const { keyId: kid, contractId: cid } = await account.connectWallet({
            getContractId: (keyId) => server.getContractId({ keyId }),
          });

          set({ keyId: base64url(kid), contractId: cid, isLoading: false });
          toast.success("Wallet connected successfully!");
        } catch (err: any) {
          // Optional fallback: if Mercury cannot find contract for key, register a new one
          const errorMessage =
            typeof err?.message === "string" ? err.message : String(err ?? "");
          const notFound = /not\s*found|no\s*credential|unknown\s*key/i.test(
            errorMessage
          );
          if (notFound) {
            try {
              const { account, server } = await import("../lib/passkey");
              const {
                keyId: kid,
                contractId: cid,
                signedTx,
              } = await account.createWallet("App", "Passkey User");
              await server.send(signedTx.toXDR());
              set({ keyId: base64url(kid), contractId: cid, isLoading: false });
              toast.success("Wallet registered successfully!");
              return;
            } catch (e2: any) {
              set({
                isLoading: false,
                error: e2?.message ?? "Registration failed",
              });
              toast.error("Registration failed");
              throw e2;
            }
          }

          set({ isLoading: false, error: errorMessage || "Connection failed" });
          toast.error("Connection failed");
          throw err;
        }
      },

      connect: async (providedKeyId?: string) => {
        // If caller explicitly provides keyId, use legacy path; else prefer login()
        if (!providedKeyId) {
          return get().login();
        }
        set({ isLoading: true, error: null });
        try {
          const { account, server } = await import("../lib/passkey");
          const { keyId: kid, contractId: cid } = await account.connectWallet({
            keyId: providedKeyId,
            getContractId: (keyId) => server.getContractId({ keyId }),
          });
          set({ keyId: base64url(kid), contractId: cid, isLoading: false });
          toast.success("Wallet connected successfully!");
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Connection failed",
          });
          toast.error("Connection failed");
          throw err;
        }
      },

      register: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const { account, server } = await import("../lib/passkey");
          const {
            keyId: kid,
            contractId: cid,
            signedTx,
          } = await account.createWallet("App", name);
          await server.send(signedTx.toXDR());
          set({ keyId: base64url(kid), contractId: cid, isLoading: false });
          toast.success("Wallet registered successfully!");
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Registration failed",
          });
          toast.error("Registration failed");
          throw err;
        }
      },

      disconnect: () => set({ keyId: null, contractId: null, error: null }),
    }),
    {
      name: "wallet-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ keyId: s.keyId, contractId: s.contractId }),
    }
  )
);
