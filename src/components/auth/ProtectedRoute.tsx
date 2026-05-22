import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/use-supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || user) return;

    navigate("/auth", {
      replace: true,
      state: { from: location.pathname },
    });
  }, [loading, location.pathname, navigate, user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="glass-card px-5 py-4 text-sm text-muted-foreground">Checking your session...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}