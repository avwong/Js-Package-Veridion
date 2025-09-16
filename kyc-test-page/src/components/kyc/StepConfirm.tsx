"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Veriff } from "@veriff/js-sdk";

interface VerificationResult {
  status: string;
  person?: {
    dateOfBirth?: string;
    fullName?: string;
    addresses?: Array<{
      fullAddress: string;
      parsedAddress?: {
        state?: string;
        street?: string;
        country?: string;
        postcode?: string;
      };
    }>;
  };
}

export function StepConfirm({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const veriff = Veriff({
      apiKey: process.env.NEXT_PUBLIC_VERIFF_API_KEY!,
      parentId: 'veriff-root',
      onSession: function(err: any, response: any) {
        if (err) {
          console.error('Veriff session error:', err);
          return;
        }
        
        // received the response, verification can be started / triggered now
        console.log('Veriff session created:', response);
        
        // redirect to verification URL
        window.location.href = response.verification.url;
      }
    });

    veriff.mount({
      formLabel: {
        givenName: 'First name',
        lastName: 'Last name'
      }
    });
  }, []);
  return (
    <div className='flex flex-col items-center justify-center min-h-[300px]'>
      <div id='veriff-root' className='w-full max-w-md'></div>
    </div>
  );
}
