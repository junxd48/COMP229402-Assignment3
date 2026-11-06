
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminContactForm() {

  // Navigate between administrator pages.
  const navigate = useNavigate();

  // Retrieve the contact ID from the URL.
  const { id } = useParams();

  // Retrieve the administrator JWT.
  const { token } = useAuth();

  // Store the contact information being edited.
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    message: "",
  });

  // Track the API request and form submission.
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store validation and API errors.
  const [error, setError] = useState("");

  // Retrieve the existing contact from MongoDB.
  useEffect(() => {

    // Allow the request to be cancelled when leaving the page.
    const controller = new AbortController();

    async function fetchContact() {

      setLoading(true);
      setError("");

      try {

        // Retrieve the selected contact through the protected API.
        const response = await fetch(`/api/contacts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to retrieve contact."
          );
        }

        // Populate the form with existing MongoDB values.
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          contactNumber: data.contactNumber || "",
          message: data.message || "",
        });

      } catch (err) {

        // Ignore intentionally cancelled requests.
        if (err.name !== "AbortError") {
          setError(err.message);
        }

      } finally {

        // Stop loading unless the request was cancelled.
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchContact();

    // Cancel pending requests when leaving the page.
    return () => controller.abort();

  }, [id, token]);

  // Update the corresponding form field.
  function handleChange(event) {

    const { name, value } = event.target;

    setFormData(function (previousData) {
      return {
        ...previousData,
        [name]: value,
      };
    });
  }

  // Save changes to the existing contact.
  async function handleSubmit(event) {

    // Prevent the browser from refreshing the page.
    event.preventDefault();

    setSaving(true);
    setError("");

    try {

      // Send the updated contact information to Express.
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update contact."
        );
      }

      // Return to Manage Contacts after saving successfully.
      navigate("/admin/contacts", { replace: true });

    } catch (err) {

      // Display validation or API errors.
      setError(err.message);

    } finally {

      // Re-enable the Save button.
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">

      <div className="page-header">
        <p className="section-label">ADMINISTRATION</p>

        <h1>Edit Contact</h1>

        <p>Update an existing contact message.</p>
      </div>

      {/* Display loading status. */}
      {loading && <p>Loading contact...</p>}

      {/* Display validation and API errors. */}
      {error && <p role="alert">{error}</p>}

      {/* Display the form after the contact has loaded. */}
      {!loading && (
        <form className="admin-form" onSubmit={handleSubmit}>

          <label htmlFor="firstName">First Name *</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label htmlFor="lastName">Last Name *</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="contactNumber">Contact Number</label>
          <input
            id="contactNumber"
            name="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleChange}
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
          />

          <div className="admin-form-actions">

            {/* Save updated contact information. */}
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Contact"}
            </button>

            {/* Return to the contacts list without saving. */}
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate("/admin/contacts")}
            >
              Cancel
            </button>

          </div>

        </form>
      )}

    </section>
  );
}

export default AdminContactForm;
