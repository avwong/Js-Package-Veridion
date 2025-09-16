"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Veriff } from "@veriff/js-sdk";
import { useWalletStore } from "@/store/walletStore";

interface VerificationResult {
  status: string;
  person?: {
    dateOfBirth?: string;
    fullName?: string;
  };
}

export function StepConfirm({ onClose }: { onClose: () => void }) {
  const { registerWithBackend, registrationStatus, contractId } = useWalletStore();
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Wait for DOM to be ready
    const initVeriff = () => {
      const veriffRoot = document.getElementById('veriff-root');
      if (!veriffRoot) {
        console.error('veriff-root element not found');
        return;
      }

      const veriff = Veriff({
        apiKey: process.env.NEXT_PUBLIC_VERIFF_API_KEY!,
        parentId: 'veriff-root',
        onSession: async function(err: any, response: any) {
          if (err) {
            console.error('Veriff session error:', err);
            return;
          }
          
          // received the response, verification can be started / triggered now
          console.log('Veriff session created:', response);
          
          // Register user with backend AFTER verification session is created
          // This prevents double registration for first-time users
          if (registrationStatus === null) {
            setIsRegistering(true);
            try {
              // Extract name from the form data if available
              const formData = response.formData || {};
              const firstName = formData.givenName || 'User';
              const lastName = formData.lastName || 'Name';
              
              await registerWithBackend(firstName, lastName);
              console.log('User registered with backend after verification session created');
            } catch (error) {
              console.error('Failed to register user with backend:', error);
              // Continue with verification even if registration fails
            } finally {
              setIsRegistering(false);
            }
          }
          
          // redirect to verification URL
          window.location.href = response.verification.url;
        }
      });

      // Include wallet information in vendorData so it's available in webhook
      const vendorData = contractId ? JSON.stringify({ 
        wallet: contractId,
        contractId: contractId,
        timestamp: new Date().toISOString()
      }) : '';
      
      veriff.setParams({
        vendorData: vendorData
      });

      veriff.mount({
        formLabel: {
          givenName: 'First name',
          lastName: 'Last name'
        },
        submitBtnText: 'Start Verification'
      });
    };

    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(initVeriff, 100);
    
    return () => clearTimeout(timer);
  }, [contractId, registrationStatus, registerWithBackend]);
  return (
    <div className='flex flex-col items-center justify-center min-h-[300px]'>
      <style jsx>{`
        #veriff-root button[type="submit"] {
          background-color: #353535 !important;
          border-color: #353535 !important;
        }
        #veriff-root button[type="submit"]:hover {
          background-color: #2a2a2a !important;
          border-color: #2a2a2a !important;
        }
      `}</style>
      <div id="veriff-root" className="w-full max-w-md"></div>
    </div>
  );
}
