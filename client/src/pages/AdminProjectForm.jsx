import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminProjectForm() {

  // Navigate after saving or cancelling.
  const navigate = useNavigate();

  // Retrieve the MongoDB project ID from the URL.
  // The ID is undefined when adding a new project.
  const { id } = useParams();

  // Determine whether the form is in Add or Edit mode.
  const isEditMode = Boolean(id);

  // Retrieve the administrator JWT.
  const { token } = useAuth();

  // Store project form fields.
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    role: "",
    outcome: "",
    startDate: "",
    endDate: "",
    completionDate: "",
  });

  // Store the image file selected from the administrator's computer.
  const [selectedImage, setSelectedImage] = useState(null);

  // Store a temporary URL for previewing the selected image.
  const [imagePreview, setImagePreview] = useState("");
  
  // Track loading existing project data.
  const [loading, setLoading] = useState(isEditMode);

  // Track form submission.
  const [saving, setSaving] = useState(false);

  // Store error messages.
  const [error, setError] = useState("");

  // Store the original project data for comparison.
  // Store the original form values for detecting changes.
  const originalFormData = useRef({
    title: "",
    description: "",
    image: "",
    role: "",
    outcome: "",
    startDate: "",
    endDate: "",
    completionDate: "",
  });

  // Track whether the current form contains unsaved changes.
  const [isDirty, setIsDirty] = useState(false);
  // Control the visibility of the Unsaved Changes dialog.
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  // Allow navigation after the project has been saved successfully.
  const [allowNavigation, setAllowNavigation] = useState(false);

  // Convert MongoDB ISO dates into YYYY-MM-DD for HTML date inputs.
  function formatDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    return String(dateValue).slice(0, 10);
  }

  // Retrieve existing project data when editing.
  useEffect(() => {

    // No project needs to be retrieved in Add mode.
    if (!isEditMode) {
      return;
    }

    const controller = new AbortController();

    async function fetchProject() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/projects/${id}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to retrieve project.");
        }

        // Populate the form with existing MongoDB values.
        // Prepare the existing project data for the form.
        const existingData = {
          title: data.title || "",
          description: data.description || "",
          image: data.image || "",
          role: data.role || "",
          outcome: data.outcome || "",
          startDate: formatDate(data.startDate),
          endDate: formatDate(data.endDate),
          completionDate: formatDate(data.completionDate),
        };

        // Remember the original values.
        originalFormData.current = existingData;

        // Populate the form.
        setFormData(existingData);

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

    fetchProject();

    return () => controller.abort();

  }, [id, isEditMode]);

  // Generate a temporary preview URL for the selected image.
  useEffect(() => {

    // Clear the preview if no new image has been selected.
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    // Create a temporary browser URL for the selected image.
    const previewURL = URL.createObjectURL(selectedImage);

    // Display the selected image in the preview.
    setImagePreview(previewURL);

    // Release the temporary URL when the image changes or component unmounts.
    return () => URL.revokeObjectURL(previewURL);

  }, [selectedImage]);


  // Detect whether the administrator has modified the form.
  useEffect(() => {

    // Wait until existing project data has finished loading.
    if (loading) {
      return;
    }

    // Compare the current form values with the original values.
    const formChanged =
      JSON.stringify(formData) !==
      JSON.stringify(originalFormData.current);

    // Selecting a new image also counts as an unsaved change.
    const hasUnsavedChanges =
      formChanged || Boolean(selectedImage);

    // Update React state.
    setIsDirty(hasUnsavedChanges);

  }, [formData, selectedImage, loading]);

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

  // Handle an image selected from the administrator's computer.
  function handleImageChange(event) {
    const file = event.target.files[0];

    // Clear the selection if no file was chosen.
    if (!file) {
      setSelectedImage(null);
      return;
    }

    // Accept only supported image formats.
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image.");
      event.target.value = "";
      setSelectedImage(null);
      return;
    }

    // Reject files larger than 5 MB.
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      event.target.value = "";
      setSelectedImage(null);
      return;
    }

    // Store the selected file for preview and uploading.
    setSelectedImage(file);
    setError("");
  }

  // Warn when refreshing or closing a page with unsaved changes.
  useEffect(() => {
    if (!isDirty || allowNavigation) {
      return;
    }

    function handleBeforeUnload(event) {
      event.preventDefault();

      // Required for compatibility with some browsers.
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };

  }, [isDirty, allowNavigation]);

  // Create or update a project.
  async function handleSubmit(event) {
    event.preventDefault();
    // Validate the relationship between project dates.
    if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      setError("End Date cannot be earlier than Start Date.");
      return;
    }

    if (
      formData.startDate &&
      formData.completionDate &&
      formData.completionDate < formData.startDate
    ) {
      setError("Completion Date cannot be earlier than Start Date.");
      return;
    }

    if (
      formData.endDate &&
      formData.completionDate &&
      formData.completionDate < formData.endDate
    ) {
      setError("Completion Date cannot be earlier than End Date.");
      return;
    }
    setSaving(true);
    setError("");

    try {

      // Convert optional blank dates into null.
      // Initially use the existing image path.
      let imagePath = formData.image;

      // Upload a new image only if the administrator selected one.
      if (selectedImage) {

        // Create multipart/form-data containing the selected image.
        const imageFormData = new FormData();
        imageFormData.append("image", selectedImage);

        // Send the image to the protected Express upload endpoint.
        const uploadResponse = await fetch("/api/projects/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageFormData,
        });

        const uploadData = await uploadResponse.json();

        // Stop saving the project if image uploading fails.
        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.message || "Unable to upload project image."
          );
        }

        // Store the image path returned by Express.
        imagePath = uploadData.image;
      }

      // Prepare project information for MongoDB.
      const projectData = {
        ...formData,
        image: imagePath,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };


      // Use PUT for Edit mode and POST for Add mode.
      const url = isEditMode
        ? `/api/projects/${id}`
        : "/api/projects";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          (isEditMode
            ? "Unable to update project."
            : "Unable to create project.")
        );
      }

      // Mark the saved form as clean.
      originalFormData.current = { ...formData };
      setIsDirty(false);

      // Allow navigation after saving.
      setAllowNavigation(true);

      // Return to the administrator project list.
      navigate("/admin/projects", { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Handle Cancel without losing unsaved changes accidentally.
  function handleCancel() {

    // Navigate immediately if nothing has changed.
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      navigate("/admin/projects");
    }
  }

  return (
    <section className="admin-page">

      <div className="page-header">
        <p className="section-label">ADMINISTRATION</p>

        <h1>
          {isEditMode ? "Edit Project" : "Add Project"}
        </h1>

        <p>
          {isEditMode
            ? "Update an existing portfolio project."
            : "Create a new portfolio project."}
        </p>
      </div>

      {/* Display loading status when retrieving a project. */}
      {loading && <p>Loading project...</p>}

      {/* Display API errors. */}
      {error && <p role="alert">{error}</p>}

      {/* Render form only after existing data has loaded. */}
      {!loading && (
        <form className="admin-form" onSubmit={handleSubmit}>

          <label htmlFor="title">Project Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          />

          {/* Select an image from the administrator's computer. */}
          <label htmlFor="projectImage">Project Image</label>
          <input
            id="projectImage"
            name="projectImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={saving}
          />

          {/* Preview the selected image or the existing project image. */}
          {(imagePreview || formData.image) && (
            <div className="admin-image-preview">
              <p>Image Preview</p>

              <img
                src={imagePreview || formData.image}
                alt="Project preview"
              />
            </div>
          )}

          {/* Allow administrators to enter an image path manually. */}
          <label htmlFor="image">Image Path</label>
          <input
            id="image"
            name="image"
            type="text"
            placeholder="/images/projects/project.jpg"
            value={formData.image}
            onChange={handleChange}
            disabled={saving || Boolean(selectedImage)}
          />

          <label htmlFor="role">Role</label>
          <input
            id="role"
            name="role"
            type="text"
            value={formData.role}
            onChange={handleChange}
          />

          <label htmlFor="outcome">Outcome</label>
          <textarea
            id="outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            rows="3"
          />

          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
          />

          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
          />

          <label htmlFor="completionDate">
            Completion Date *
          </label>
          <input
            id="completionDate"
            name="completionDate"
            type="date"
            value={formData.completionDate}
            onChange={handleChange}
            required
          />

          <div className="admin-form-actions">

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : isEditMode
                  ? "Update Project"
                  : "Save Project"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
            >
              Cancel
            </button>

          </div>

        </form>        
      )}
    
      {/* Display the dialog only after Cancel is clicked with unsaved changes. */}
      {showUnsavedDialog && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unsaved-title"
            aria-describedby="unsaved-description"
          >
            <h2 id="unsaved-title">Unsaved Changes</h2>

            <p id="unsaved-description">
              You have unsaved changes. Are you sure you want to leave
              this page?
            </p>

            <div className="admin-form-actions">
              <button
                type="button"
                onClick={() => {
                  // Close the dialog and navigate without saving.
                  setShowUnsavedDialog(false);
                  navigate("/admin/projects");
                }}
              >
                Leave Without Saving
              </button>

              <button
                type="button"
                onClick={() => {
                  // Close the dialog and keep the current form values.
                  setShowUnsavedDialog(false);
                }}
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminProjectForm;
