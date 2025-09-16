"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound, UserPlus, Loader2 } from "lucide-react";

export function StepLogin({
  isLoading,
  onLogin,
  onCancel,
  onRegister,
}: {
  isLoading: boolean;
  onLogin: () => void;
  onCancel: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-none border-0 bg-white/90">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Secure Authentication
          </CardTitle>
          <CardDescription className="text-gray-600">
            Use your passkey for secure and passwordless authentication
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={onLogin}
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
            size="lg"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

            {/* REGISTER Form is not being used */}
          <Button
            onClick={onRegister}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 border-gray-300 hover:bg-gray-50 hover:text-gray-900 font-medium transition-all duration-200 disabled:opacity-50 bg-transparent"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating passkey...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Register with Passkey
              </>
            )}
          </Button>

          <div className="pt-4 text-center">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 underline-offset-4 hover:underline disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
