import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

/**
 * Protects a route by auth and role.
 * - Accepts either:
 *   - requiredRole="ADMIN"  (string) OR
 *   - roles={["ADMIN","PRESIDENT"]} (array)
 * - Compares roles case-insensitively.
 */
export default function ProtectedRoute({ requiredRole, roles, children }) {
  const { isLoading, currentUser } = useAuth();

  // While auth is being resolved, render nothing or a global spinner
  if (isLoading) return null;

  // If not authenticated, redirect to login
  if (!currentUser) return <Navigate to="/login" replace />;

  // When role protection is defined, normalize and verify
  const userRole = String(currentUser.role || "").toUpperCase();
  const allowed = roles
    ? roles.map((r) => String(r).toUpperCase())
    : requiredRole
    ? [String(requiredRole).toUpperCase()]
    : null;

  if (allowed && !allowed.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  // Authorized – render protected content
  return children;
}
