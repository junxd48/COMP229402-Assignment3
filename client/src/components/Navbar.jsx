/****************************************************************/
/* Provides site-wide navigation. Brings together React Router, */
/* shared components, and individual page components.           */
/****************************************************************/

// NavLink component allows tracking which page is currently active.
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  // Access authentication information from AuthContext.
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Allows navigation after signing out.
  const navigate = useNavigate();

  // Remove authentication information and return to Home.
  function handleSignOut() {
    navigate("/signout", { replace: true });
  }

  return (
    <nav>
      <div>
        <NavLink to="/">
            <img src="/images/logo.png" alt="JD Technologies logo" />
        </NavLink>
      </div>

      <div>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/education">Education</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/contact">Contact</NavLink>

        {/* Display administrator navigation only for admins. */}
        {isAdmin && (
          <NavLink to="/admin">Admin</NavLink>
        )}

        {/* Display different controls depending on login state. */}
        {isAuthenticated ? (
          <>
            <button
              type="button"
              className="nav-signout"
              onClick={handleSignOut}
            >
              <span className="nav-username">{user.name}</span>
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <NavLink to="/signin">Sign In</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

// Exports so it can be imported and used by other files
export default Navbar;