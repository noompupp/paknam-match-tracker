
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle } from "lucide-react";

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
}

const PasscodeModal = ({ isOpen, onClose, onSuccess, title, description }: PasscodeModalProps) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const CORRECT_PASSCODE = "810001";

  const handleSubmit = async () => {
    if (passcode.length !== 6) {
      setError("Please enter a complete 6-digit passcode");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (passcode === CORRECT_PASSCODE) {
      onSuccess();
      handleClose();
    } else {
      setError("Invalid passcode. Please try again.");
      setPasscode("");
    }

    setIsLoading(false);
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
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={passcode}
              onChange={handlePasscodeChange}
              disabled={isLoading}
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
              disabled={passcode.length !== 6 || isLoading}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasscodeModal;
