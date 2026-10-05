import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("digital-krishi-token");
    const userData = localStorage.getItem("digital-krishi-user");
    
    if (!token || !userData) {
      setIsAuthenticated(false);
      toast({
        title: "Login Required",
        description: "Please log in to access this feature",
        variant: "destructive"
      });
    } else {
      setIsAuthenticated(true);
    }
  }, [toast]);

  if (isAuthenticated === null) {
    // Loading animation before dashboard opens
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <span className="text-lg font-semibold text-primary">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;