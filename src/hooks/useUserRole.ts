
import { useState, useEffect } from "react";
import { useSecureAuth } from "@/contexts/SecureAuthContext";

export function useUserRole() {
  const { user, hasRole } = useSecureAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Check roles in order of priority
        if (await hasRole('admin')) {
          setRole('admin');
        } else if (await hasRole('referee_rater')) {
          setRole('referee_rater');
        } else if (await hasRole('referee')) {
          setRole('referee');
        } else if (await hasRole('rater')) {
          setRole('rater');
        } else if (await hasRole('viewer')) {
          setRole('viewer');
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user, hasRole]);

  return { role, loading, isAdmin: role === 'admin' };
}
