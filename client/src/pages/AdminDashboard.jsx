
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {

  // Retrieve the currently authenticated administrator.
  const { user } = useAuth();

  return (
    <section className="admin-page">

      <div className="page-header">
        <p className="section-label">ADMINISTRATION</p>
        <h1>Administrator Dashboard</h1>
        <p>Welcome, {user.name}!</p>
        <p>
          Manage your portfolio projects, qualifications,
          and contact messages.
        </p>
      </div>

      <div className="admin-grid">

        <Link to="/admin/projects" className="admin-card">
          <h2>Projects</h2>
          <p>
            Add, edit, view, and delete portfolio projects.
          </p>
          <span>Manage Projects</span>
        </Link>

        <Link to="/admin/qualifications" className="admin-card">
          <h2>Qualifications</h2>
          <p>
            Manage education, certifications, and training.
          </p>
          <span>Manage Qualifications</span>
        </Link>

        <Link to="/admin/contacts" className="admin-card">
          <h2>Contact Messages</h2>
          <p>
            Review, update, and delete submitted messages.
          </p>
          <span>Manage Contacts</span>
        </Link>

      </div>
    </section>
  );
}

export default AdminDashboard;

