import { Link, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { User, Menu, X } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { getUserByEmail, getServiceBookings } from "../services/firebaseService"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  // Handle responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    setIsVisible(!(currentScrollY > lastScrollY && currentScrollY > 100))
    setLastScrollY(currentScrollY)
  }, [lastScrollY])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      
      if (firebaseUser) {
        try {
          // Force refresh the user's ID token to get latest data
          await firebaseUser.reload()
          
          const userDoc = await getUserByEmail(firebaseUser.email)
          
          if (userDoc) {
            // Merge Firebase Auth data with Firestore data to ensure photoURL is present
            const mergedUser = {
              ...userDoc,
              photoURL: userDoc.photoURL || firebaseUser.photoURL,
              displayName: userDoc.name || firebaseUser.displayName
            }
            // console.log('User data loaded:', mergedUser) // Debug log
            setUser(mergedUser)
            const services = await getServiceBookings(userDoc.uid)
            setUserServices(services)
          } else {
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
        setUser(null)
        setUserServices([])
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleAuthSuccess = useCallback(async (userData) => {
    // Ensure we have the latest photoURL from Firebase Auth if available
    const currentUser = auth.currentUser
    const mergedUserData = {
      ...userData,
      photoURL: userData.photoURL || currentUser?.photoURL || null
    }
    
    console.log('Auth success - merged user data:', mergedUserData) // Debug log
    setUser(mergedUserData)
    setShowAuth(false)
    
    try {
      const services = await getServiceBookings(mergedUserData.uid)
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

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' }
  ]

  const getLinkStyle = (path, isMobileLink = false) => ({
    color: location.pathname === path ? "#4f46e5" : "#1f1f1f",
    fontWeight: 600,
    textDecoration: "none",
    fontFamily: "Inter, sans-serif",
    padding: isMobileLink ? "0.875rem 1.5rem" : "0.5rem 1rem",
    borderRadius: isMobileLink ? "12px" : "9999px",
    background: location.pathname === path ? "rgba(79, 70, 229, 0.1)" : "transparent",
    display: "block",
    transition: "all 0.3s ease",
    fontSize: isMobileLink ? "16px" : "14px"
  })

  const userCircleStyle = {
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

  const UserCircle = ({ onClick }) => (
    user ? (
      <div
        style={{
          ...userCircleStyle,
          backgroundColor: "#4f46e5",
          color: "white"
        }}
        onClick={onClick}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3730a3"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4f46e5"}
        title={`${user.name} - ${userServices.length} services`}
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              console.error('Error loading profile image:', user.photoURL)
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
            }}
          />
        ) : (
          <User size={18} />
        )}
        {userServices.length > 0 && (
          <span style={{
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
          }}>
            {userServices.length}
          </span>
        )}
      </div>
    ) : (
      <div
        style={{
          ...userCircleStyle,
          border: "2px solid #4f46e5",
          backgroundColor: "transparent",
          color: "#4f46e5"
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#4f46e5"
          e.currentTarget.style.color = "white"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent"
          e.currentTarget.style.color = "#4f46e5"
        }}
        title="Sign in to access your account"
      >
        <User size={18} />
      </div>
    )
  )

  if (loading) {
    return (
      <nav style={{
        position: "fixed",
        top: isMobile ? "1rem" : "1.5rem",
        left: isMobile ? "1rem" : "50%",
        right: isMobile ? "1rem" : "auto",
        transform: isMobile ? "none" : "translateX(-50%)",
        zIndex: 52,
        width: isMobile ? "auto" : "calc(100% - 4rem)",
        maxWidth: isMobile ? "auto" : "1200px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          padding: isMobile ? "1rem 1.5rem" : "0.75rem 2rem",
          borderRadius: isMobile ? "20px" : "9999px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}>
          <div style={{ opacity: 0.5, fontSize: "18px", fontWeight: "700" }}>Loading...</div>
          <div style={{
            ...userCircleStyle,
            border: "2px solid #4f46e5",
            backgroundColor: "transparent",
            color: "#4f46e5",
            opacity: 0.5,
            cursor: "default"
          }}>
            <User size={18} />
          </div>
        </div>
      </nav>
    )
  }

  if (!isMobile) {
    // Desktop Navbar
    return (
      <>
        <nav style={{
          position: "fixed",
          top: "1.5rem",
          left: "50%",
          transform: `translateX(-50%) translateY(${isVisible ? "0" : "-100px"})`,
          zIndex: 52,
          opacity: isVisible ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            padding: "0.75rem 2rem",
            borderRadius: "9999px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            border: "1px solid rgba(255,255,255,0.3)",
            width: "fit-content",
            margin: "0 auto"
          }}>
            {/* Left Side Links */}
            <Link style={getLinkStyle("/")} to="/">Home</Link>
            <Link style={getLinkStyle("/about")} to="/about">About</Link>
            <Link style={getLinkStyle("/services")} to="/services">Services</Link>

            {/* Center - User Profile */}
            <div style={{ position: "relative" }}>
              <UserCircle onClick={() => user ? setShowProfile(!showProfile) : setShowAuth(true)} />
              
              {showProfile && user && (
                <div style={{ 
                  position: "absolute", 
                  top: "100%", 
                  left: "50%", 
                  transform: "translateX(-50%)", 
                  marginTop: "8px" 
                }}>
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
            <Link style={getLinkStyle("/projects")} to="/projects">Projects</Link>
            <Link style={getLinkStyle("/blog")} to="/blog">Blog</Link>
            <Link style={getLinkStyle("/contact")} to="/contact">Contact</Link>
          </div>
        </nav>

        <GoogleAuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    )
  }

  // Mobile Navbar
  return (
    <>
      <nav style={{
        position: "fixed",
        top: "1rem",
        left: "1rem",
        right: "1rem",
        zIndex: 52,
        transform: `translateY(${isVisible ? "0" : "-100px"})`,
        opacity: isVisible ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          padding: "1rem 1.5rem",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}>
          {/* Logo/Brand */}
          <Link to="/" style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#4f46e5",
            textDecoration: "none",
            display: "flex",
            alignItems: "center"
          }}>
            Emmanuel
          </Link>

          {/* Right side: User + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* User Icon */}
            <UserCircle onClick={() => user ? setShowProfile(!showProfile) : setShowAuth(true)} />

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                background: mobileMenuOpen ? "rgba(79, 70, 229, 0.1)" : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: mobileMenuOpen ? "#4f46e5" : "#1f1f1f",
                borderRadius: "8px",
                transition: "all 0.3s ease"
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            left: 0,
            right: 0,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            padding: "0.5rem",
            animation: "slideDown 0.3s ease"
          }}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={getLinkStyle(link.path, true)}
                onMouseEnter={(e) => {
                  if (location.pathname !== link.path) {
                    e.currentTarget.style.backgroundColor = "rgba(79, 70, 229, 0.05)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== link.path) {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User Profile Modal for Mobile */}
      {showProfile && user && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowProfile(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 99,
              animation: "fadeIn 0.2s ease"
            }}
          />
          
          {/* Profile Modal */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
            maxWidth: "calc(100vw - 2rem)",
            maxHeight: "calc(100vh - 2rem)",
            overflow: "auto"
          }}>
            <UserProfile
              user={user}
              services={userServices}
              onLogout={handleLogout}
              onClose={() => setShowProfile(false)}
            />
          </div>
        </>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(2px)",
            zIndex: 51,
            animation: "fadeIn 0.2s ease"
          }}
        />
      )}

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* CSS Animations */}
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  )
}