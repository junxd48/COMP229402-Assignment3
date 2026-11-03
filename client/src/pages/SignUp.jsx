
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {

  // Navigate to the Sign In page after successful registration.
  const navigate = useNavigate();

  // Store the information entered in the registration form.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Track the registration request and any errors.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update the corresponding field whenever the user types.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  }

  // Process the registration form.
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Verify that both password fields match.
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Only send the fields expected by the backend.
      // Do not send confirmPassword or a user role.
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // Redirect to Sign In after successful registration.
      navigate("/signin", {
        state: {
          message: "Account created successfully. Please sign in."
        }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

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
            minLength={8}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

      </form>

      <p>
        Already have an account? <Link to="/signin">Sign In</Link>
      </p>
    </section>
  );
}

export default SignUp;
