
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("PROTECTED ROUTE CHECK:", {
    path: location.pathname,
    user: user,
    role: user?.role,
    loading: loading,
    allowedRoles: allowedRoles,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading TownExpress...</p>
      </div>
    );
  }

  if (!user) {
    console.log("REDIRECT: No authenticated user");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("REDIRECT: Role not allowed");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("ACCESS GRANTED:", location.pathname);

  return <Outlet />;
}
