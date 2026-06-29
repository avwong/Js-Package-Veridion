"use client";

import { useState, useEffect } from "react";
import kyc from "@oppia/kyc-client";
import type { KycStatus, KycResult } from "@oppia/kyc-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Key,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";

function formatTimeRemaining(expiresAtSeconds: number): string {
  const remaining = expiresAtSeconds - Math.floor(Date.now() / 1000);
  if (remaining <= 0) return "Expired";
  const days = Math.floor(remaining / 86_400);
  if (days >= 1) return `Session valid for ${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(remaining / 3_600);
  if (hours >= 1)
    return `Session valid for ${hours} hour${hours !== 1 ? "s" : ""}`;
  const minutes = Math.ceil(remaining / 60);
  return `Session expires in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

export default function Home() {
  const [kycStatus, setKycStatus] = useState<KycStatus>("unknown");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | undefined>(undefined);
  const [config, setConfig] = useState({
    edgeUrl: "http://localhost:3000",
    clientId: "netjs-demo",
    insecureNoSession: true,
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-9), `[${timestamp}] ${message}`]); // Keep last 10 logs
  };

  useEffect(() => {
    // Initialize KYC client
    try {
      kyc.init({
        ...config,
        onStatusChange: (newStatus) => {
          setKycStatus(newStatus);
          addLog(`📊 Status changed to: ${newStatus}`);
        },
        onTokenExpired: () => {
          setKycStatus("unknown");
          setToken(null);
          setExpiresAt(undefined);
          const ts = new Date().toLocaleTimeString();
          setLogs((prev) => [
            ...prev.slice(-9),
            `[${ts}] 🔒 Session expired — re-prompting verification`,
          ]);
          setLoading(true);
          kyc
            .startKyc({ openMode: "popup" })
            .then((result) => {
              const ts2 = new Date().toLocaleTimeString();
              if (result.ok) {
                setKycStatus(result.status);
                if (result.token) setToken(result.token);
                if (result.expiresAt !== undefined)
                  setExpiresAt(result.expiresAt);
                setLogs((prev) => [
                  ...prev.slice(-9),
                  `[${ts2}] ✅ Re-verified: ${result.status}`,
                ]);
              } else {
                setLogs((prev) => [
                  ...prev.slice(-9),
                  `[${ts2}] ❌ Re-verification failed: ${result.error}`,
                ]);
              }
            })
            .catch((err: unknown) => {
              const ts3 = new Date().toLocaleTimeString();
              setLogs((prev) => [
                ...prev.slice(-9),
                `[${ts3}] ❌ Re-verification error: ${
                  err instanceof Error ? err.message : "Unknown"
                }`,
              ]);
            })
            .finally(() => setLoading(false));
        },
      });
      addLog("✅ KYC Client initialized successfully!");
    } catch (error) {
      addLog(
        `❌ Failed to initialize: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, [config]);

  const handleStartKyc = async (openMode: "popup" | "iframe") => {
    setLoading(true);
    addLog(`🚀 Starting KYC in ${openMode} mode...`);

    try {
      const result: KycResult = await kyc.startKyc({ openMode });

      if (result.ok) {
        addLog(`✅ KYC completed successfully: ${result.status}`);
        if (result.token) {
          setToken(result.token);
          addLog(`🔑 Token received: ${result.token.substring(0, 20)}...`);
        }
        if (result.expiresAt !== undefined) {
          setExpiresAt(result.expiresAt);
          addLog(`⏱️ ${formatTimeRemaining(result.expiresAt)}`);
        }
      } else {
        addLog(`❌ KYC failed: ${result.error}`);
      }
    } catch (error) {
      addLog(
        `❌ KYC error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    addLog("🔍 Checking KYC status...");

    try {
      const currentStatus = await kyc.checkStatus();
      setKycStatus(currentStatus);
      addLog(`📊 Current status: ${currentStatus}`);
    } catch (error) {
      addLog(
        `❌ Status check error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    kyc.logout();
    setToken(null);
    setExpiresAt(undefined);
    addLog("🚪 User logged out");
  };

  const getStatusIcon = (status: KycStatus) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: KycStatus) => {
    switch (status) {
      case "verified":
        return "default" as const;
      case "pending":
        return "secondary" as const;
      case "rejected":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 KYC + Passkey + Stellar Demo
          </h1>
          <p className="text-lg text-gray-600">
            Next.js application with KYC verification, Passkey authentication,
            and Stellar integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Configure your KYC client settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edgeUrl">Edge URL</Label>
                <Input
                  id="edgeUrl"
                  value={config.edgeUrl}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, edgeUrl: e.target.value }))
                  }
                  placeholder="http://localhost:4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={config.clientId}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, clientId: e.target.value }))
                  }
                  placeholder="your-app-id"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insecure"
                  checked={config.insecureNoSession}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      insecureNoSession: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="insecure" className="text-sm">
                  Insecure No-Session Mode (Hackathon)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Status Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                KYC Status
              </CardTitle>
              <CardDescription>Current verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge
                  variant={getStatusVariant(kycStatus)}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(kycStatus)}
                  {kycStatus.toUpperCase()}
                </Badge>
              </div>

              {expiresAt !== undefined && kycStatus === "verified" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Validity:</span>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <Clock className="h-3 w-3" />
                    {formatTimeRemaining(expiresAt)}
                  </Badge>
                </div>
              )}

              {token && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Token:</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                      {showToken ? token : `${token.substring(0, 20)}...`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={handleCheckStatus}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {loading ? "⏳" : "🔍"} Check Status
                </Button>
                <Button
                  onClick={handleLogout}
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Actions
              </CardTitle>
              <CardDescription>Start KYC verification process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleStartKyc("popup")}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "⏳ Loading..." : "🚀 Start KYC (Popup)"}
              </Button>

              <Button
                onClick={() => handleStartKyc("iframe")}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {loading ? "⏳ Loading..." : "🚀 Start KYC (Iframe)"}
              </Button>

              <Separator />

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Coming Soon: Passkey & Stellar Integration
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Passkey
                  </Button>
                  <Button
                    disabled
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    Stellar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Panel */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Event Log
              </CardTitle>
              <Button onClick={clearLogs} variant="outline" size="sm">
                🗑️ Clear
              </Button>
            </div>
            <CardDescription>
              Real-time events and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No events yet. Try an action above!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded text-sm font-mono border"
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Built with Next.js, TypeScript, Tailwind CSS, and @oppia/kyc-client
          </p>
          <p className="mt-1">
            Dependencies: passkey-kit, passkey-kit-sdk, zustand,
            @stellar/stellar-sdk
          </p>
        </div>
      </div>
    </div>
  );
}
