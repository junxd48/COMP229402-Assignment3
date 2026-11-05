
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminQualifications() {

  // Retrieve the administrator JWT for protected API requests.
  const { token } = useAuth();  
  
  // Store qualifications retrieved from MongoDB.
  const [qualifications, setQualifications] = useState([]);

  // Track whether the API request is running.
  const [loading, setLoading] = useState(true);

  // Store any API error message.
  const [error, setError] = useState("");
  
  // Store the qualification selected for deletion.
  const [qualificationToDelete, setQualificationToDelete] = useState(null);

  // Track whether a deletion request is running.
  const [deleting, setDeleting] = useState(false);
  
  // Retrieve qualifications when the component mounts.
  useEffect(() => {

    // Allow the request to be cancelled if the component unmounts.
    const controller = new AbortController();

    async function fetchQualifications() {
      try {

        // Request qualifications from the Express backend.
        const response = await fetch("/api/qualifications", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to retrieve qualifications.");
        }

        // Convert the JSON response into JavaScript objects.
        const data = await response.json();

        // Update the qualifications displayed in the table.
        setQualifications(data);

      } catch (err) {

        // Ignore requests cancelled during unmounting.
        if (err.name !== "AbortError") {
          setError(err.message);
        }

      } finally {

        // Stop the loading indicator unless the request was cancelled.
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchQualifications();

    // Cancel pending requests when leaving the page.
    return () => controller.abort();

  }, []);

  
  // Delete the selected qualification after administrator confirmation.
  async function handleDelete() {

    // Stop if no qualification is selected or a deletion is in progress.
    if (!qualificationToDelete || deleting) {
      return;
    }

    setDeleting(true);
    setError("");

    try {

      // Send a protected DELETE request to Express.
      const response = await fetch(
        `/api/qualifications/${qualificationToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle errors returned by the backend.
      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message || "Unable to delete qualification."
        );
      }

      // Remove the deleted qualification from the displayed list.
      setQualifications(function (previousQualifications) {
        return previousQualifications.filter(function (qualification) {
          return qualification._id !== qualificationToDelete._id;
        });
      });

      // Close the confirmation dialog.
      setQualificationToDelete(null);

    } catch (err) {

      // Display the error without removing the qualification.
      setError(err.message);

    } finally {

      // Re-enable the Delete button.
      setDeleting(false);
    }
  }


  return (
    <section className="admin-page">

      <div className="page-header">
        <p className="section-label">ADMINISTRATION</p>
        <h1>Manage Qualifications</h1>
        <p>
          View and manage education, certifications, and training.
        </p>
      </div>

      <div className="admin-projects-container">

        <div className="admin-projects-header">
          <Link to="/admin" className="admin-back-link">
            Back to Dashboard
          </Link>
          <Link to="/admin/qualifications/add"
            className="admin-action-btn">
                Add Qualification
          </Link>
        </div>

        {/* Show loading status. */}
        {loading && <p>Loading qualifications...</p>}

        {/* Show API errors. */}
        {error && <p role="alert">{error}</p>}

        {/* Show a message if MongoDB contains no qualifications. */}
        {!loading && !error && qualifications.length === 0 && (
          <p>No qualifications available.</p>
        )}

        {/* Display qualifications retrieved from MongoDB. */}
        {!loading && !error && qualifications.length > 0 && (
          <div className="admin-table-wrapper">

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Qualification</th>
                  <th>Institution</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {qualifications.map((qualification) => (
                  <tr key={qualification._id}>
                    <td>{qualification.title}</td>
                    <td>{qualification.institution}</td>
                    <td>{qualification.category}</td>
                    <td>{qualification.year}</td>
                    <td>{qualification.inProgress ? "In Progress" : "Completed"}</td>
                    <td>
                        <div className="admin-row-actions">
                          <Link to={`/admin/qualifications/edit/${qualification._id}`}
                            className="admin-edit-button">
                              Edit
                          </Link>
                          {/* Open the confirmation dialog before deleting. */}
                          <button type="button" className="admin-delete-button"
                            onClick={() => setQualificationToDelete(qualification)}
                            disabled={deleting}
                          >
                            Delete
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Display a confirmation dialog when a qualification is selected. */}
            {qualificationToDelete && (
              <div className="admin-modal-overlay">

                <div
                  className="admin-modal"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="delete-qualification-title"
                  aria-describedby="delete-qualification-description"
                >

                  <h2 id="delete-qualification-title">
                    Delete Qualification
                  </h2>

                  <p id="delete-qualification-description">
                    Are you sure you want to delete
                    {" "}
                    <strong>{qualificationToDelete.title}</strong>?
                    This action cannot be undone.
                  </p>

                  <div className="admin-form-actions">

                    {/* Confirm deletion. */}
                    <button
                      type="button" onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Deleting..." : "Delete Qualification"}
                    </button>

                    {/* Cancel deletion and close the dialog. */}
                    <button type="button" onClick={() => setQualificationToDelete(null)}
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

export default AdminQualifications;
