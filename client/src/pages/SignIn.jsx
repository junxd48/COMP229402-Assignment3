
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignIn() {

  // Used to navigate to another page after login.
  const navigate = useNavigate();

  const location = useLocation();
  const successMessage = location.state?.message;

  // Access the shared authentication context.
  const { signIn } = useAuth();

  // Store the values entered in the form.
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Store request status and error messages.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update the corresponding form field.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  }

  // Submit login credentials to the Express API.
  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // Handle invalid credentials or other API errors.
      if (!response.ok) {
        throw new Error(data.message || "Sign in failed.");
      }

      // Store the JWT and user information in AuthContext.
      signIn(data.token, data.user);

      // Navigate to the homepage after successful login.
      navigate("/");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <h1>Sign In</h1>

      {successMessage && (
        <p role="status" className="success-message">
          {successMessage}
        </p>
      )}
      
      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>

      </form>

      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </section>
  );
}

export default SignIn;
