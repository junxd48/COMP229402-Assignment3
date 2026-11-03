
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {

  // Access the authentication status from AuthContext.
  const { isAuthenticated } = useAuth();

  // Retrieve the current URL before redirecting.
  const location = useLocation();

  // Redirect unauthenticated visitors to the Sign In page.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location }}
      />
    );
  }

  // Render the child route when authenticated.
  return <Outlet />;
}

export default ProtectedRoute;
