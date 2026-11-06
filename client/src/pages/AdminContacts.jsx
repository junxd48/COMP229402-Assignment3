
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminContacts() {

  // Retrieve the administrator JWT.
  const { token } = useAuth();

  // Store contact messages retrieved from MongoDB.
  const [contacts, setContacts] = useState([]);

  // Track whether the API request is running.
  const [loading, setLoading] = useState(true);

  // Store API error messages.
  const [error, setError] = useState("");

  // Store the contact selected for deletion.
  const [contactToDelete, setContactToDelete] = useState(null);

  // Track whether a deletion request is in progress.
  const [deleting, setDeleting] = useState(false);

  // Retrieve contact messages when the component mounts.
  useEffect(() => {

    // Allow cancellation when the component unmounts.
    const controller = new AbortController();

    async function fetchContacts() {

      try {

        // Request contact messages from the protected Express API.
        const response = await fetch("/api/contacts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to retrieve contact messages.");
        }

        // Convert the JSON response into JavaScript objects.
        const data = await response.json();

        // Display newest messages first.
        data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Store the retrieved messages in React state.
        setContacts(data);

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

    fetchContacts();

    // Cancel the request when leaving the component.
    return () => controller.abort();

  }, [token]);

  // Delete the selected contact after administrator confirmation.
  async function handleDelete() {

    // Prevent deletion without a selected contact.
    if (!contactToDelete || deleting) {
      return;
    }

    setDeleting(true);
    setError("");

    try {

      // Send the DELETE request to the protected Express endpoint.
      const response = await fetch(
        `/api/contacts/${contactToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle unsuccessful responses from the backend.
      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message || "Unable to delete contact."
        );
      }

      // Remove the deleted contact from React state.
      setContacts(function (previousContacts) {
        return previousContacts.filter(function (contact) {
          return contact._id !== contactToDelete._id;
        });
      });

      // Close the confirmation dialog.
      setContactToDelete(null);

    } catch (err) {

      // Display an error without removing the contact.
      setError(err.message);

    } finally {

      // Re-enable deletion controls.
      setDeleting(false);
    }
  }


  return (
    <section className="admin-page">

      <div className="page-header">
        <p className="section-label">ADMINISTRATION</p>

        <h1>Manage Contacts</h1>

        <p>
          View and manage messages submitted through the portfolio
          contact form.
        </p>
      </div>

      <div className="admin-projects-container">

        <div className="admin-projects-header">
          <Link to="/admin" className="admin-back-link">
            Back to Dashboard
          </Link>
        </div>

        {/* Display loading status. */}
        {loading && <p>Loading contact messages...</p>}

        {/* Display API errors. */}
        {error && <p role="alert">{error}</p>}

        {/* Display a message when no contacts exist. */}
        {!loading && !error && contacts.length === 0 && (
          <p>No contact messages available.</p>
        )}

        {/* Display contact messages retrieved from MongoDB. */}
        {!loading && !error && contacts.length > 0 && (
          <div className="admin-table-wrapper">

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Message</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                    <td>{contact.firstName} {contact.lastName}</td>
                    <td>{contact.email}</td>
                    <td>{contact.contactNumber || "—"}</td>
                    <td>{contact.message || "—"}</td>
                    <td>
                      <div className="admin-row-actions">
                        {/* Navigate to the Edit Contact form. */}
                        <Link to={`/admin/contacts/edit/${contact._id}`}
                          className="admin-edit-button">
                            Edit
                        </Link>

                        {/* Open the Delete Contact confirmation dialog. */}
                        <button type="button" className="admin-delete-button"
                          onClick={() => setContactToDelete(contact)}
                          disabled={deleting}>
                            Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Display confirmation dialog for the selected contact. */}
            {contactToDelete && (
              <div className="admin-modal-overlay">
                <div  className="admin-modal"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="delete-contact-title"
                    aria-describedby="delete-contact-description">
                  <h2 id="delete-contact-title">
                    Delete Contact
                  </h2>
                  <p id="delete-contact-description">
                    Are you sure you want to delete the message from{" "}
                    <strong>
                      {contactToDelete.firstName} {contactToDelete.lastName}
                    </strong>?
                    This action cannot be undone.
                  </p>
                  <div className="admin-form-actions">

                    {/* Confirm deletion. */}
                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={handleDelete}
                      disabled={deleting}>
                      {deleting ? "Deleting..." : "Delete Contact"}
                    </button>

                    {/* Cancel deletion. */}
                    <button
                      type="button"
                      onClick={() => setContactToDelete(null)}
                      disabled={deleting}>
                        Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminContacts;
