
import RoleGuard from "./RoleGuard";

// This component is kept for backward compatibility but redirects to RoleGuard
interface ProtectedTabWrapperProps {
  children: React.ReactNode;
  tabId: string;
  title: string;
  description: string;
  requiredRole?: string;
}

const ProtectedTabWrapper = ({ 
  children, 
  tabId, 
  title, 
  description,
  requiredRole = "referee"
}: ProtectedTabWrapperProps) => {
  console.warn('⚠️ ProtectedTabWrapper component is deprecated. Use RoleGuard instead.');
  
  return (
    <RoleGuard requiredRole={requiredRole}>
      {children}
    </RoleGuard>
  );
};

export default ProtectedTabWrapper;
