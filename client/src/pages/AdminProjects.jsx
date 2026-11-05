
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminProjects() {

  // Store the projects retrieved from MongoDB.
  const [projects, setProjects] = useState([]);

  // Track the API request status.
  const [loading, setLoading] = useState(true);

  // Store an error message if the request fails.
  const [error, setError] = useState("");

  // Retrieve the administrator's JWT.
  const { token } = useAuth();

  // Track the project selected for deletion.
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Track whether a deletion request is running.
  const [deleting, setDeleting] = useState(false);

  // Retrieve projects when the component mounts.
  useEffect(() => {

    // Allow the request to be cancelled during unmounting.
    const controller = new AbortController();

    async function fetchProjects() {
      try {
        // Request all projects from the Express API.
        const response = await fetch("/api/projects", {
          signal: controller.signal,
        });

        // Check whether the request succeeded.
        if (!response.ok) {
          throw new Error("Unable to retrieve projects.");
        }

        // Convert the response into JavaScript objects.
        const data = await response.json();

        // Store the projects in React state.
        setProjects(data);

      } catch (err) {

        // Ignore cancelled requests.
        if (err.name !== "AbortError") {
          setError(err.message);
        }

      } finally {

        // Update loading state only if not cancelled.
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProjects();

    // Cancel pending requests when leaving the page.
    return () => controller.abort();

  }, []);

  
async function handleDelete() {

  // Do nothing if no project has been selected.
  if (!projectToDelete || deleting) {
    return;
  }

  setDeleting(true);
  setError("");

  try {

    // Send the administrator JWT with the DELETE request.
    const response = await fetch(
      `/api/projects/${projectToDelete._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    // Display the API error if deletion fails.
    if (!response.ok) {
      throw new Error(data.message || "Unable to delete project.");
    }

    // Remove the deleted project from React state.
    setProjects(function (previousProjects) {
      return previousProjects.filter(function (project) {
        return project._id !== projectToDelete._id;
      });
    });

    // Close the confirmation dialog.
    setProjectToDelete(null);

  } catch (err) {
    setError(err.message);

  } finally {
    setDeleting(false);
  }
}

  return (
    <section className="admin-page">

      <div className="page-header">
        <p className="section-label">ADMINISTRATION</p>
        <h1>Manage Projects</h1>
        <p>
          View and manage portfolio projects stored in MongoDB.
        </p>
      </div>

      <div className="admin-projects-container">

        <div className="admin-projects-header">
          <Link to="/admin" className="admin-back-link">
            Back to Dashboard
          </Link>

            <Link to="/admin/projects/new" className="admin-add-button">
              + Add Project
            </Link>
        </div>

        {/* Show loading status. */}
        {loading && <p>Loading projects...</p>}

        {/* Show API errors. */}
        {error && <p role="alert">{error}</p>}

        {/* Show empty database message. */}
        {!loading && !error && projects.length === 0 && (
          <p>No projects available.</p>
        )}

        {/* Display retrieved projects in a table. */}
        {!loading && !error && projects.length > 0 && (

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Project Title</th>
                  <th>Role</th>
                  <th>Completion Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.title}</td>
                    <td>{project.role || "—"}</td>
                    <td>
                      {project.completionDate
                        ? new Date(
                            project.completionDate
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <Link
                          to={`/admin/projects/${project._id}/edit`}
                          className="admin-edit-button"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() => setProjectToDelete(project)}
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
          </div>
        )}
      </div>
      
      {/* Show confirmation only when a project is selected. */}
      {projectToDelete && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            aria-describedby="delete-project-description"
          >
            <h2 id="delete-project-title">Delete Project</h2>
            <p id="delete-project-description">
              Are you sure you want to delete
              <strong> {projectToDelete.title}</strong>?
            </p>
            <p>This action cannot be undone.</p>
            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-delete-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminProjects;
