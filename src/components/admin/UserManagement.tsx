
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Eye, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'referee' | 'viewer';
  created_at: string;
}

interface UserData {
  id: string;
  email: string;
  role?: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAdmin, user } = useSupabaseAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // First get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('auth_roles')
        .select('*');
      
      if (rolesError) {
        throw rolesError;
      }

      // Note: In a real app, you'd need admin access to auth.users
      // For now, we'll just show the roles we have access to
      const usersWithRoles = rolesData?.map(role => ({
        id: role.user_id,
        email: role.user_id.substring(0, 8) + '...', // Show partial ID for privacy
        role: role.role,
        created_at: role.created_at
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('auth_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      });

      // Refresh the users list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin()) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need admin privileges to access user management.
        </AlertDescription>
      </Alert>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'referee': return <Users className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'referee': return 'default';
      case 'viewer': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No users found
              </div>
            ) : (
              users.map((userData) => (
                <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{userData.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Registered: {new Date(userData.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={getRoleColor(userData.role || 'viewer')} className="flex items-center gap-1">
                      {getRoleIcon(userData.role || 'viewer')}
                      {userData.role || 'viewer'}
                    </Badge>
                    
                    {userData.id !== user?.id && (
                      <Select
                        value={userData.role || 'viewer'}
                        onValueChange={(newRole) => updateUserRole(userData.id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="referee">Referee</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {userData.id === user?.id && (
                      <span className="text-sm text-muted-foreground">(You)</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Role Permissions:</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span><strong>Viewer:</strong> Read-only access to all public data</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span><strong>Referee:</strong> Can modify teams, members, fixtures, and match events</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span><strong>Admin:</strong> Full access including user management and operation logs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
