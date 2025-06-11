
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useSecureAuth } from "@/contexts/SecureAuthContext";

interface AuthButtonProps {
  onSignOut: () => Promise<void>;
  onSignIn: () => void;
  textRef: (el: HTMLSpanElement | null) => void;
}

const AuthButton = ({ onSignOut, onSignIn, textRef }: AuthButtonProps) => {
  const { user } = useSecureAuth();

  if (user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onSignOut}
        className="mobile-nav-item transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
        title={`Sign out (${user.email})`}
      >
        <LogOut className="h-5 w-5" />
        <span 
          ref={textRef}
          className="text-xs font-medium whitespace-nowrap"
        >
          Sign out
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSignIn}
      className="mobile-nav-item transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
      title="Sign in to access referee tools"
    >
      <User className="h-5 w-5" />
      <span 
        ref={textRef}
        className="text-xs font-medium whitespace-nowrap"
      >
        Login
      </span>
    </Button>
  );
};

export default AuthButton;
