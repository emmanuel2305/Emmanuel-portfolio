// App.jsx
import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import AdminNavbar from "./components/AdminNavbar.jsx"
import Home from "./pages/Home.jsx"
import About from "./pages/About.jsx"
import Projects from "./pages/Projects.jsx"
import Blog from "./pages/Blog.jsx"
import Contact from "./pages/Contact.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import AddProject from "./pages/AddProject.jsx"
import AddBlog from "./pages/AddBlog.jsx"
import Services from "./pages/Services.jsx"

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <div style={{ paddingTop: isAdminRoute ? "0" : "6rem" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />

          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add-project" element={<AddProject />} />
          <Route path="/admin/add-blog" element={<AddBlog />} />
        </Routes>
      </div>
    </>
  )
}