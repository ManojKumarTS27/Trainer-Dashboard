import { Navigate } from "react-router-dom";

function RoleProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("authUser") || "null"
  );

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Invalid role
  if (!user.role) {
    return <Navigate to="/access-denied" replace />;
  }

  // Unauthorized role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default RoleProtectedRoute;