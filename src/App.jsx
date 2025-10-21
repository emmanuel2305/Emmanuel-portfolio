// App.jsx
import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./config/firebase"
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
import ServiceManagement from "./pages/ServiceManagement.jsx"
import AdminUsers from "./pages/AdminUsers.jsx"
import AdminAnalytics from "./pages/AdminAnalytics.jsx" // Add this import

// Admin email configuration
const ADMIN_EMAIL = "emmanuelnavaraj@gmail.com"

// Protected Route Component for Admin
function ProtectedAdminRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAdmin(currentUser?.email === ADMIN_EMAIL)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#667eea', fontSize: '1.1rem', fontWeight: '600' }}>
            Verifying access...
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          maxWidth: '400px',
          margin: '2rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem'
          }}>
            🔒
          </div>
          <h2 style={{
            color: '#2d3436',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            Access Denied
          </h2>
          <p style={{
            color: '#636e72',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            {!user 
              ? "Please sign in to continue. Admin access is restricted to authorized personnel only."
              : "You don't have permission to access the admin panel. This area is restricted to administrators only."
            }
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 2rem',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    )
  }

  return children
}

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

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/service-management" 
            element={
              <ProtectedAdminRoute>
                <ServiceManagement />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/add-project" 
            element={
              <ProtectedAdminRoute>
                <AddProject />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/add-blog" 
            element={
              <ProtectedAdminRoute>
                <AddBlog />
              </ProtectedAdminRoute>
            } 
          />
          {/* Add Analytics Route */}
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedAdminRoute>
                <AdminAnalytics />
              </ProtectedAdminRoute>
            } 
          />
        </Routes>
      </div>
    </>
  )
}