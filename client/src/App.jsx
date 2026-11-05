/**********************************************/
/* Application composition and routing.       */
/* Connects Navbar, Routes/pages, and Footer. */
/**********************************************/

// Imports the React Router components needed to handle navigation and routing.
// BrowserRouter enables browser-based routing.
// Routes contains all available Route definitions.
// Route connects a URL path to a specific React component.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Education from "./pages/Education";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import SignOut from "./pages/SignOut";
import AdminProjects from "./pages/AdminProjects";
import AdminProjectForm from "./pages/AdminProjectForm";
import AdminQualifications from "./pages/AdminQualifications";
import AdminQualificationForm from "./pages/AdminQualificationForm";
import AdminContacts from "./pages/AdminContacts";

function App() {
  return (
    // Enables React Router for all components contained inside it
    <BrowserRouter>
      <AuthProvider>  
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/education" element={<Education />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signout" element={<SignOut />} />
            
            {/* Routes requiring authentication */}
            <Route element={<ProtectedRoute />}>
              {/* We will add signed-in user pages here later. */}
            </Route>

            {/* Routes requiring administrator privileges */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/projects/new" element={<AdminProjectForm />} />
              <Route path="/admin/projects/:id/edit" element={<AdminProjectForm />} />
              <Route path="/admin/qualifications" element={<AdminQualifications />} />
              <Route path="/admin/qualifications/add" element={<AdminQualificationForm />} />
              <Route path="/admin/qualifications/edit/:id" element={<AdminQualificationForm />}/>
              <Route path="/admin/contacts" element={<AdminContacts />}/>
            </Route>
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Exports so it can be imported and used by other files
export default App;