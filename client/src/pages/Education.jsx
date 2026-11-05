// Import React hooks for managing state and component lifecycle.
import { useState, useEffect } from "react";

function Education() {
  // Store qualifications retrieved from MongoDB.
  const [qualifications, setQualifications] = useState([]);

  // Track whether the API request is still processing.
  const [loading, setLoading] = useState(true);

  // Store any error message from the API request.
  const [error, setError] = useState("");

  // Retrieve qualifications when the component mounts.
  useEffect(() => {
    // Allow the request to be cancelled when the component unmounts.
    const controller = new AbortController();

    // Define an asynchronous function to retrieve qualifications.
    async function fetchQualifications() {
      try {
        // Send an HTTP GET request to the Express API.
        const response = await fetch("/api/qualifications", {
          signal: controller.signal,
        });

        // Check whether the request succeeded.
        if (!response.ok) {
          throw new Error("Failed to retrieve qualifications.");
        }

        // Convert the JSON response into JavaScript objects.
        const data = await response.json();

        // Sort by year, newest first.
        data.sort((a, b) => Number(b.year) - Number(a.year));

        // Store the qualifications in React state.
        setQualifications(data);

      } catch (err) {
        // Ignore errors caused by intentional cancellation.
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        // Mark loading as complete unless the request was cancelled.
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    // Execute the asynchronous function.
    fetchQualifications();

    // Cancel the request when the component unmounts.
    return () => controller.abort();
  }, []);

  // Group qualifications by their category.
  const education = qualifications.filter(
    (item) => item.category === "Education"
  );

  const certifications = qualifications.filter(
    (item) => item.category === "Certification"
  );

  const training = qualifications.filter(
    (item) => item.category === "Training"
  );

  // Define the display order of qualification categories.
  const qualificationGroups = [
    { title: "Education", items: education },
    { title: "Certifications", items: certifications },
    { title: "Training", items: training },
  ];

  return (
    <section className="education-page">
      <div className="page-header">
        <p className="section-label">MY BACKGROUND</p>

        <h1>Education & Qualifications</h1>

        <p>
          My academic background and professional development have provided
          a foundation in engineering, software development, information
          technology, and cybersecurity.
        </p>
      </div>

      {/* Display a message while waiting for the API response. */}
      {loading && <p>Loading qualifications...</p>}

      {/* Display an error if the API request fails. */}
      {error && <p role="alert">{error}</p>}

      {/* Display a message if no qualifications exist. */}
      {!loading && !error && qualifications.length === 0 && (
        <p>No qualifications available.</p>
      )}

      {/* Display qualifications grouped by category. */}
      {!loading && !error && qualifications.length > 0 && (
        <div className="education-groups">

          {qualificationGroups.map((group) => (

            // Display a category only if it contains qualifications.
            group.items.length > 0 && (
              <section className="education-group" key={group.title}>

                {/* Category heading. */}
                <h2 className="education-group-title">
                  {group.title}
                </h2>

                <div className="education-list">

                  {group.items.map((item) => (
                    <article className="education-item" key={item._id}>

                      {/* Qualification year. */}
                      <div className="education-year">
                        {item.year}
                      </div>

                      {/* Qualification details. */}
                      <div className="education-details">

                        <h3>{item.title}</h3>

                        <h4>{item.institution}</h4>

                        {/* Show progress status when applicable. */}
                        {item.inProgress && (
                          <p className="education-status">
                            In Progress
                          </p>
                        )}

                        {/* Display description only when available. */}
                        {item.description && (
                          <p>{item.description}</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      )}

    </section>
  );
}

// Export the Education component for use in App.jsx.
export default Education;