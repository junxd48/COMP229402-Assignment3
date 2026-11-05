
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminQualificationForm() {

  // Navigate back to the qualifications list.
  const navigate = useNavigate();
  // Retrieve the qualification ID from the URL.
  // Undefined when adding a new qualification.
  const { id } = useParams();

  // Determine whether the form is in Add or Edit mode.
  const isEditMode = Boolean(id);
  // Retrieve the administrator JWT.
  const { token } = useAuth();

  // Store qualification form values.
  const [formData, setFormData] = useState({
    title: "",
    institution: "",
    category: "Education",
    year: "",
    completionDate: "",
    inProgress: false,
    description: "",
  });

  // Track form submission.
  const [saving, setSaving] = useState(false);

  // Store validation and API errors.
  const [error, setError] = useState("");
  // Track loading when retrieving an existing qualification.
  const [loading, setLoading] = useState(isEditMode);

  // Retrieve the existing qualification when editing.
  useEffect(() => {

    // No data needs to be retrieved in Add mode.
    if (!isEditMode) {
      return;
    }

    const controller = new AbortController();

    async function fetchQualification() {
      setLoading(true);
      setError("");

      try {
        // Retrieve the qualification by its MongoDB ID.
        const response = await fetch(`/api/qualifications/${id}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to retrieve qualification."
          );
        }

        // Populate the form with the existing qualification values.
        setFormData({
          title: data.title || "",
          institution: data.institution || "",
          category: data.category || "Education",
          year: data.year || "",
          completionDate: data.completionDate
            ? String(data.completionDate).slice(0, 10)
            : "",
          inProgress: Boolean(data.inProgress),
          description: data.description || "",
        });

      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchQualification();
    return () => controller.abort();
  }, [id, isEditMode]);

  // Update form values when the administrator enters information.
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData(function (previousData) {
      return {
        ...previousData,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  }

  // Submit the new qualification to MongoDB through Express.
  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      // Prepare qualification data for the backend.
      const qualificationData = {
        ...formData,
        completionDate: formData.completionDate || null,
      };

      // Send the new qualification to the protected API.
      // Use PUT for Edit and POST for Add.
      const url = isEditMode
        ? `/api/qualifications/${id}`
        : "/api/qualifications";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(qualificationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 
            (isEditMode
              ? "Unable to update qualification."
              : "Unable to create qualification.")
        );
      }

      // Return to the qualifications list after saving.
      navigate("/admin/qualifications", { replace: true });

    } catch (err) {
      setError(err.message);

    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">

      <div className="page-header">
        <p className="section-label">ADMINISTRATION</p>
        <h1>{isEditMode ? "Edit Qualification" : "Add Qualification"}</h1>
        <p>
          {isEditMode
            ? "Update an existing qualification."
            : "Add education, certification, or training information."}
        </p>
      </div>

      {error && <p role="alert">{error}</p>}

      {loading && <p>Loading qualification...</p>}

      {!loading && (      
        <form className="admin-form" onSubmit={handleSubmit}>

          <label htmlFor="title">Qualification Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="institution">Institution *</label>
          <input
            id="institution"
            name="institution"
            type="text"
            value={formData.institution}
            onChange={handleChange}
            required
          />

          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="Education">Education</option>
            <option value="Certification">Certification</option>
            <option value="Training">Training</option>
          </select>

          <label htmlFor="year">Year *</label>
          <input
            id="year"
            name="year"
            type="text"
            placeholder="e.g., 2026"
            value={formData.year}
            onChange={handleChange}
            required
          />

          <label htmlFor="completionDate">Completion Date</label>
          <input
            id="completionDate"
            name="completionDate"
            type="date"
            value={formData.completionDate}
            onChange={handleChange}
            disabled={formData.inProgress}
          />

          <label className="admin-checkbox-label">
            <input
              name="inProgress"
              type="checkbox"
              checked={formData.inProgress}
              onChange={handleChange}
            />
            In Progress
          </label>

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEditMode 
                ? "Update Qualification" : "Save Qualification"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => navigate("/admin/qualifications")}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default AdminQualificationForm;
