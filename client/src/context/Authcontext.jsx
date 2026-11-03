
import { createContext, useContext, useState } from "react";

// Create a context for sharing authentication information.
const AuthContext = createContext(null);

// AuthProvider makes authentication information available
// to all components nested inside it.
export function AuthProvider({ children }) {

  // Retrieve previously stored authentication information.
  // sessionStorage retains data during page refreshes but
  // clears it when the browser tab's session ends.
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Store the JWT and user information after successful login.
  function signIn(newToken, newUser) {
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  }

  // Remove the authentication information when signing out.
  function signOut() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }

  // Determine whether the user has authentication state.
  const isAuthenticated = Boolean(token && user);

  // Determine whether the signed-in user is an administrator.
  const isAdmin = isAuthenticated && user.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing authentication information.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
