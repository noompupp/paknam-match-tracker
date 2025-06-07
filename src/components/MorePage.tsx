
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DebugPanel from "./DebugPanel";
import UserManagement from "./admin/UserManagement";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { AlertCircle, LogOut, Shield, User, Database } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const MorePage = () => {
  const { user, userRole, signOut, isAdmin } = useSupabaseAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      window.location.href = '/auth';
    }
    setIsSigningOut(false);
  };

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Role: {userRole || 'Loading...'}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management - Admin Only */}
        {isAdmin() && <UserManagement />}

        {/* Debug Panel - Admin Only */}
        {isAdmin() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Debug
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DebugPanel />
            </CardContent>
          </Card>
        )}

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Security Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">✅ Enabled Security Features</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Row Level Security (RLS) enabled</li>
                  <li>• Role-based access control</li>
                  <li>• Secure authentication system</li>
                  <li>• Database activity logging</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">🔒 Your Permissions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• View all public data: ✅</li>
                  <li>• Modify team/match data: {userRole === 'referee' || userRole === 'admin' ? '✅' : '❌'}</li>
                  <li>• User management: {userRole === 'admin' ? '✅' : '❌'}</li>
                  <li>• System administration: {userRole === 'admin' ? '✅' : '❌'}</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Contact an administrator if you need elevated permissions for your role.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MorePage;
