import { Link, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { User } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { addUser, getUserByEmail, getServiceBookings } from "../services/firebaseService"
import LoginModal from './Auth/LoginModal'
import GoogleAuthModal from './Auth/GoogleAuthModal'
import UserProfile from './Profile/UserProfile'

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [userServices, setUserServices] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  // Memoize scroll handler to prevent recreation on every render
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    setIsVisible(!(currentScrollY > lastScrollY && currentScrollY > 100))
    setLastScrollY(currentScrollY)
  }, [lastScrollY])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      
      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userDoc = await getUserByEmail(firebaseUser.email)
          
          if (userDoc) {
            setUser(userDoc)
            // Load user's service bookings
            const services = await getServiceBookings(userDoc.uid)
            setUserServices(services)
          } else {
            // User exists in Firebase Auth but not in Firestore
            // This shouldn't happen with proper setup, but handle it gracefully
            console.warn('User authenticated but no Firestore document found')
            setUser(null)
            setUserServices([])
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
          setUserServices([])
        }
      } else {
        // User is signed out
        setUser(null)
        setUserServices([])
      }
      
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const handleAuthSuccess = useCallback(async (userData) => {
    setUser(userData)
    setShowAuth(false)
    
    // Load user's services
    try {
      const services = await getServiceBookings(userData.uid)
      setUserServices(services)
    } catch (error) {
      console.error('Error loading user services:', error)
      setUserServices([])
    }
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserServices([])
      setShowProfile(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

  const navbarStyle = {
    position: "fixed",
    top: "1.5rem",
    left: "50%",
    transform: `translateX(-50%) translateY(${isVisible ? "0" : "-100px"})`,
    zIndex: 52,
    opacity: isVisible ? 1 : 0,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  }

  const navbarInnerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    padding: "0.75rem 2rem",
    borderRadius: "9999px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
    border: "1px solid rgba(255,255,255,0.3)",
  }

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? "#4f46e5" : "#1f1f1f",
    fontWeight: 600,
    textDecoration: "none",
    fontFamily: "Inter, sans-serif",
    padding: "0.5rem 1rem",
    borderRadius: "9999px",
    background: location.pathname === path ? "rgba(79, 70, 229, 0.1)" : "transparent",
  })

  const loginCircleStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative"
  }

  const guestCircleStyle = {
    ...loginCircleStyle,
    border: "2px solid #4f46e5",
    backgroundColor: "transparent",
    color: "#4f46e5"
  }

  const userCircleStyle = {
    ...loginCircleStyle,
    backgroundColor: "#4f46e5",
    color: "white"
  }

  const badgeStyle = {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "10px",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold"
  }

  // Show loading state briefly
  if (loading) {
    return (
      <nav style={navbarStyle}>
        <div style={navbarInnerStyle}>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link style={getLinkStyle("/")} to="/">Home</Link>
            <Link style={getLinkStyle("/about")} to="/about">About</Link>
            <Link style={getLinkStyle("/services")} to="/services">Services</Link>
          </div>
          
          <div style={{ position: "relative" }}>
            <div style={{
              ...guestCircleStyle,
              opacity: 0.5,
              cursor: 'default'
            }}>
              <User size={18} />
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link style={getLinkStyle("/projects")} to="/projects">Projects</Link>
            <Link style={getLinkStyle("/blog")} to="/blog">Blog</Link>
            <Link style={getLinkStyle("/contact")} to="/contact">Contact</Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav style={navbarStyle}>
        <div style={navbarInnerStyle}>
          {/* Left Side Links */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link style={getLinkStyle("/")} to="/">
              Home
            </Link>
            <Link style={getLinkStyle("/about")} to="/about">
              About
            </Link>
            <Link style={getLinkStyle("/services")} to="/services">
              Services
            </Link>
          </div>

          {/* Center - Login/Profile Circle */}
          <div style={{ position: "relative" }}>
            {user ? (
              <div
                style={userCircleStyle}
                onClick={() => setShowProfile(!showProfile)}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#3730a3"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#4f46e5"}
                title={`${user.name} - ${userServices.length} services`}
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <User size={18} />
                )}
                {userServices.length > 0 && (
                  <span style={badgeStyle}>
                    {userServices.length}
                  </span>
                )}
              </div>
            ) : (
              <div
                style={guestCircleStyle}
                onClick={() => setShowAuth(true)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#4f46e5"
                  e.target.style.color = "white"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent"
                  e.target.style.color = "#4f46e5"
                }}
                title="Sign in to access your account"
              >
                <User size={18} />
              </div>
            )}
            
            {/* User Profile Dropdown */}
            {showProfile && user && (
              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px" }}>
                <UserProfile
                  user={user}
                  services={userServices}
                  onLogout={handleLogout}
                  onClose={() => setShowProfile(false)}
                />
              </div>
            )}
          </div>

          {/* Right Side Links */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link style={getLinkStyle("/projects")} to="/projects">
              Projects
            </Link>
            <Link style={getLinkStyle("/blog")} to="/blog">
              Blog
            </Link>
            <Link style={getLinkStyle("/contact")} to="/contact">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  )
}