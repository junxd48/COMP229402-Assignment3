
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignOut() {
  const { signOut } = useAuth();

  // Clear authentication when this public page mounts.
  useEffect(() => {
    signOut();
    // Run only when the SignOut page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return to the public Home page.
  return <Navigate to="/" replace />;
}

export default SignOut;
