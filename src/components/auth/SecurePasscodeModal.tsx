
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle, Shield } from "lucide-react";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { securityMonitoringService } from "@/services/security/securityMonitoringService";

interface SecurePasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
  requiredRole?: string;
}

const SecurePasscodeModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title, 
  description,
  requiredRole = "referee"
}: SecurePasscodeModalProps) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, hasRole } = useSecureAuth();

  // Secure passcode - in production this would be stored securely
  const SECURE_PASSCODE = "810001";

  const handleSubmit = async () => {
    if (passcode.length !== 6) {
      setError("Please enter a complete 6-digit passcode");
      return;
    }

    if (!user) {
      setError("You must be logged in to access this area");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (passcode === SECURE_PASSCODE) {
        // Verify user has the required role
        const userHasRole = await hasRole(requiredRole);
        
        if (!userHasRole) {
          await securityMonitoringService.logPermissionDenied(
            user.id,
            title,
            "passcode_access"
          );
          setError("You don't have permission to access this area");
          return;
        }

        // Log successful access
        await securityMonitoringService.logSecurityEvent({
          type: 'auth_attempt',
          severity: 'low',
          description: `Successful passcode access to ${title}`,
          userId: user.id,
          metadata: { feature: title }
        });

        onSuccess();
        handleClose();
      } else {
        // Log failed attempt
        await securityMonitoringService.logFailedAuthAttempt(
          user.email || 'unknown',
          `Invalid passcode for ${title}`
        );
        setError("Invalid passcode. Please try again.");
        setPasscode("");
      }
    } catch (error) {
      console.error('❌ Passcode verification error:', error);
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPasscode("");
    setError("");
    setIsLoading(false);
    onClose();
  };

  const handlePasscodeChange = (value: string) => {
    setPasscode(value);
    if (error) {
      setError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!user && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                You must be logged in to access this area. Please sign in first.
              </AlertDescription>
            </Alert>
          )}
          
          {user && (
            <>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={passcode}
                  onChange={handlePasscodeChange}
                  disabled={isLoading || !user}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={passcode.length !== 6 || isLoading || !user}
                  className="w-full"
                >
                  {isLoading ? "Verifying..." : "Verify Passcode"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurePasscodeModal;
