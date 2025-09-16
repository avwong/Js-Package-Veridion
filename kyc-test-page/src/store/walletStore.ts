import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import base64url from "base64url";
import { toast } from "sonner";
import { BackendAPI } from "../lib/backend-api";

export interface WalletState {
  keyId: string | null;
  contractId: string | null;
  isLoading: boolean;
  error: string | null;
  registrationStatus: 'pending' | 'completed' | 'failed' | null;
}
export interface WalletActions {
  setKeyId: (keyId: string) => void;
  setContractId: (contractId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRegistrationStatus: (status: 'pending' | 'completed' | 'failed' | null) => void;
  /** Always attempts login first; falls back to register on not-found */
  login: () => Promise<void>;
  /** Deprecated: kept for API parity, calls login() unless a keyId is explicitly provided */
  connect: (keyId?: string) => Promise<void>;
  register: (name: string, surnames: string) => Promise<void>;
  createPasskeyOnly: (name: string) => Promise<void>;
  registerWithBackend: (name: string, surnames: string) => Promise<void>;
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
      registrationStatus: null,

      setKeyId: (keyId) => set({ keyId }),
      setContractId: (contractId) => set({ contractId }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setRegistrationStatus: (registrationStatus) => set({ registrationStatus }),

      login: async () => {
        set({ isLoading: true, error: null });
        try {
          const { account, server } = await import("../lib/passkey");

          // Force user presence: always call connectWallet (WebAuthn prompt)
          const { keyId: kid, contractId: cid } = await account.connectWallet({
            getContractId: (keyId) => server.getContractId({ keyId }),
          });

          set({ keyId: base64url(kid), contractId: cid, isLoading: false });
          
          // Check KYC status after successful login
          try {
            const kycStatus = await BackendAPI.getStatus(cid);
            if (kycStatus.success && kycStatus.data) {
              const status = kycStatus.data.status;
              if (status === 'APPROVED') {
                toast.success("Wallet connected! KYC verified ✅");
              } else if (status === 'REJECTED') {
                toast.warning("Wallet connected! KYC rejected ❌");
              } else if (status === 'PENDING') {
                toast.info("Wallet connected! KYC pending ⏳");
              } else {
                toast.success("Wallet connected successfully!");
              }
            } else {
              toast.success("Wallet connected successfully!");
            }
          } catch (kycError) {
            console.warn('Could not check KYC status:', kycError);
            toast.success("Wallet connected successfully!");
          }
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
              
              // Check KYC status after successful registration
              try {
                const kycStatus = await BackendAPI.getStatus(cid);
                if (kycStatus.success && kycStatus.data) {
                  const status = kycStatus.data.status;
                  if (status === 'APPROVED') {
                    toast.success("Wallet registered! KYC verified ✅");
                  } else if (status === 'REJECTED') {
                    toast.warning("Wallet registered! KYC rejected ❌");
                  } else if (status === 'PENDING') {
                    toast.info("Wallet registered! KYC pending ⏳");
                  } else {
                    toast.success("Wallet registered successfully!");
                  }
                } else {
                  toast.success("Wallet registered successfully!");
                }
              } catch (kycError) {
                console.warn('Could not check KYC status:', kycError);
                toast.success("Wallet registered successfully!");
              }
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

      register: async (name: string, surnames: string) => {
        set({ isLoading: true, error: null, registrationStatus: 'pending' });
        try {
          const { account, server } = await import("../lib/passkey");
          
          // Step 1: Create wallet with passkey
          const {
            keyId: kid,
            contractId: cid,
            signedTx,
          } = await account.createWallet("App", name);
          
          // Step 2: Call backend to build register transaction
          const buildResponse = await BackendAPI.buildRegisterTransaction({
            wallet: cid,
            name: name,
            surnames: surnames,
            sourceAccount: cid, // Using contractId as source account
          });

          if (!buildResponse.success || !buildResponse.xdr) {
            throw new Error(buildResponse.error || 'Failed to build register transaction');
          }

          // Step 3: For now, we'll use the original signed transaction
          // In a real implementation, you would need to sign the backend transaction
          // with the passkey. This might require additional methods from PasskeyKit
          const signedXdr = signedTx.toXDR();

          // Step 4: Submit the signed transaction
          const submitResponse = await BackendAPI.submitSignedTransaction({
            signedXdr: signedXdr,
          });

          if (!submitResponse.success) {
            throw new Error(submitResponse.error || 'Failed to submit transaction');
          }

          // Step 5: Send the original wallet creation transaction
          await server.send(signedTx.toXDR());
          
          set({ 
            keyId: base64url(kid), 
            contractId: cid, 
            isLoading: false,
            registrationStatus: 'completed'
          });
          toast.success("Wallet registered and submitted to backend successfully!");
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Registration failed",
            registrationStatus: 'failed'
          });
          toast.error("Registration failed");
          throw err;
        }
      },

      createPasskeyOnly: async (name: string) => {
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
          toast.success("Passkey created successfully!");
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Passkey creation failed",
          });
          toast.error("Passkey creation failed");
          throw err;
        }
      },

      registerWithBackend: async (name: string, surnames: string) => {
        set({ isLoading: true, error: null, registrationStatus: 'pending' });
        try {
          const { account } = await import("../lib/passkey");
          const state = get();
          
          if (!state.contractId) {
            throw new Error('No wallet found. Please create a passkey first.');
          }

          // Call backend to build register transaction
          const buildResponse = await BackendAPI.buildRegisterTransaction({
            wallet: state.contractId,
            name: name,
            surnames: surnames,
            sourceAccount: state.contractId,
          });

          if (!buildResponse.success || !buildResponse.xdr) {
            throw new Error(buildResponse.error || 'Failed to build register transaction');
          }

          // For now, we'll use a simple approach since we don't have direct transaction signing
          // In a real implementation, you would sign the backend transaction with the passkey
          const signedXdr = buildResponse.xdr; // This would be the signed transaction

          // Submit the signed transaction
          const submitResponse = await BackendAPI.submitSignedTransaction({
            signedXdr: signedXdr,
          });

          if (!submitResponse.success) {
            throw new Error(submitResponse.error || 'Failed to submit transaction');
          }

          set({ 
            isLoading: false,
            registrationStatus: 'completed'
          });
          toast.success("User registered with backend successfully!");
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Backend registration failed",
            registrationStatus: 'failed'
          });
          // toast.error("Backend registration failed");
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
