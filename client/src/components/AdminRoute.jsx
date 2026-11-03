
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {

  // Remember the attempted destination.
  const location = useLocation();
  // Retrieve authentication and administrator status.
  const { isAuthenticated, isAdmin } = useAuth();

  // Unauthenticated visitors must sign in first.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location }}
      />
    );
  }

  // Signed-in regular users cannot access admin pages.
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render the requested admin page.
  return <Outlet />;
}

export default AdminRoute;
