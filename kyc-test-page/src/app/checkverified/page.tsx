"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/store/walletStore';
import { CheckCircle, XCircle, Clock, AlertCircle, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { BackendAPI } from '@/lib/backend-api';

interface VerificationStatus {
  wallet: string;
  name: string;
  surnames: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'NOT_FOUND';
  verifiedAt?: string;
  submittedAt?: string;
  rejectedAt?: string;
  reason?: string;
}

export default function CheckVerifiedPage() {
  const { contractId, registrationStatus, login, isLoading, disconnect } = useWalletStore();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (contractId) {
      // Check verification status from backend API
      setLoading(true);
      BackendAPI.getStatus(contractId)
        .then(response => {
          if (response.success && response.data) {
            setVerificationStatus({
              wallet: response.data.wallet,
              name: response.data.name || 'Unknown',
              surnames: response.data.surnames || 'User',
              status: response.data.status,
              verifiedAt: response.data.verifiedAt,
              submittedAt: response.data.submittedAt,
              rejectedAt: response.data.rejectedAt,
              reason: response.data.reason
            });
          } else {
            setVerificationStatus({
              wallet: contractId,
              name: 'Unknown',
              surnames: 'User',
              status: 'NOT_FOUND'
            });
          }
        })
        .catch(error => {
          console.error('Error fetching KYC status:', error);
          setVerificationStatus({
            wallet: contractId,
            name: 'Unknown',
            surnames: 'User',
            status: 'NOT_FOUND'
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [contractId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'NOT_FOUND':
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'REJECTED':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'NOT_FOUND':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Your identity has been successfully verified!';
      case 'REJECTED':
        return 'Your verification was rejected. Please try again.';
      case 'PENDING':
        return 'Your verification is currently being reviewed.';
      case 'NOT_FOUND':
        return 'No verification found. Please complete the KYC process.';
      default:
        return 'Unknown status.';
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setVerificationStatus(null);
  };

  const handleRefresh = async () => {
    if (contractId) {
      setLoading(true);
      try {
        const response = await BackendAPI.getStatus(contractId);
        
        if (response.success && response.data) {
          setVerificationStatus({
            wallet: response.data.wallet,
            name: response.data.name || 'Unknown',
            surnames: response.data.surnames || 'User',
            status: response.data.status,
            verifiedAt: response.data.verifiedAt,
            submittedAt: response.data.submittedAt,
            rejectedAt: response.data.rejectedAt,
            reason: response.data.reason
          });
        } else {
          setVerificationStatus({
            wallet: contractId,
            name: 'Unknown',
            surnames: 'User',
            status: 'NOT_FOUND'
          });
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error);
        setVerificationStatus({
          wallet: contractId,
          name: 'Unknown',
          surnames: 'User',
          status: 'NOT_FOUND'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!contractId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h1>
            <p className="text-gray-600 mb-6">
              Login with your passkey to check your KYC verification status.
            </p>
            
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 disabled:opacity-50 mb-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Login with Passkey
                </>
              )}
            </Button>

            <div className="text-center">
              <a 
                href="/kyc" 
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Go to KYC Process
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              KYC Verification Status
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                Switch Wallet
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Wallet Address</h3>
                <div className="flex items-center text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </div>
              </div>
              <p className="text-sm text-gray-600 font-mono break-all">
                {contractId}
              </p>
            </div>

            {/* Registration Status */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Registration Status</h3>
              <p className="text-sm text-gray-600">
                {registrationStatus === 'completed' ? '✅ Registered with backend' : 
                 registrationStatus === 'pending' ? '⏳ Registration pending' :
                 registrationStatus === 'failed' ? '❌ Registration failed' :
                 '❌ Not registered'}
              </p>
            </div>

            {/* Verification Status */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking verification status...</p>
              </div>
            ) : verificationStatus ? (
              <div className={`rounded-lg p-6 border-2 ${getStatusColor(verificationStatus.status)}`}>
                <div className="flex items-center mb-4">
                  {getStatusIcon(verificationStatus.status)}
                  <h3 className="text-lg font-semibold ml-3">
                    {verificationStatus.status}
                  </h3>
                </div>
                
                <p className="text-sm mb-4">
                  {getStatusMessage(verificationStatus.status)}
                </p>

                <div className="space-y-2 text-sm">
                  {verificationStatus.name !== 'Unknown' && (
                    <div>
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{verificationStatus.name} {verificationStatus.surnames}</span>
                    </div>
                  )}
                  
                  {verificationStatus.verifiedAt && (
                    <div>
                      <span className="font-medium">Verified At:</span>
                      <span className="ml-2">{new Date(verificationStatus.verifiedAt).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {verificationStatus.submittedAt && (
                    <div>
                      <span className="font-medium">Submitted At:</span>
                      <span className="ml-2">{new Date(verificationStatus.submittedAt).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {verificationStatus.rejectedAt && (
                    <div>
                      <span className="font-medium">Rejected At:</span>
                      <span className="ml-2">{new Date(verificationStatus.rejectedAt).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {verificationStatus.reason && (
                    <div>
                      <span className="font-medium">Reason:</span>
                      <span className="ml-2 text-red-600">{verificationStatus.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {verificationStatus?.status === 'NOT_FOUND' && (
                <a 
                  href="/kyc" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors"
                >
                  Start KYC Process
                </a>
              )}
              
              {verificationStatus?.status === 'REJECTED' && (
                <a 
                  href="/kyc" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors"
                >
                  Retry Verification
                </a>
              )}
              
              {verificationStatus?.status === 'PENDING' && (
                <Button 
                  disabled
                  className="flex-1 bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Verification Pending
                </Button>
              )}
              
              {verificationStatus?.status === 'APPROVED' && (
                <Button 
                  disabled
                  className="flex-1 bg-green-600 text-white cursor-default"
                >
                  ✅ Verified
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
