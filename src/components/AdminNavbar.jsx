import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase"

export default function AdminNavbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [user, setUser] = useState(null)
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(!(currentScrollY > lastScrollY && currentScrollY > 100))
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

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
    gap: "1.5rem",
    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))",
    backdropFilter: "blur(15px)",
    padding: "0.75rem 2.5rem",
    borderRadius: "9999px",
    boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  }

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? "#fef2f2" : "#fecaca",
    fontWeight: 600,
    textDecoration: "none",
    fontFamily: "Inter, sans-serif",
    padding: "0.6rem 1.2rem",
    borderRadius: "9999px",
    background:
      location.pathname === path ? "rgba(255, 255, 255, 0.25)" : "transparent",
    transition: "all 0.2s ease",
    fontSize: "0.95rem",
    whiteSpace: "nowrap"
  })

  const adminBadgeStyle = {
    background: "rgba(255, 255, 255, 0.2)",
    color: "#fef2f2",
    padding: "0.4rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  }

  const userMenuStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center"
  }

  const userAvatarStyle = {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#fef2f2",
    fontWeight: "600",
    transition: "all 0.3s ease"
  }

  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    right: "0",
    marginTop: "0.5rem",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(15px)",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    minWidth: "200px",
    padding: "0.5rem",
    display: showLogoutMenu ? "block" : "none",
    zIndex: 100
  }

  const dropdownItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
    fontWeight: "500"
  }

  const dividerStyle = {
    width: "1px",
    height: "2rem",
    background: "rgba(255,255,255,0.3)",
    margin: "0 0.5rem"
  }

  const handleLinkHover = (e, isActive) => {
    if (!isActive) {
      e.target.style.background = "rgba(255, 255, 255, 0.15)"
      e.target.style.color = "#fef2f2"
    }
  }

  const handleLinkLeave = (e, isActive) => {
    if (!isActive) {
      e.target.style.background = "transparent"
      e.target.style.color = "#fecaca"
    }
  }

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(name => name[0]).join('').toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'A'
  }

  return (
    <nav style={navbarStyle}>
      <div style={navbarInnerStyle}>
        <div style={adminBadgeStyle}>
          🔐 ADMIN
        </div>
        
        <div style={dividerStyle}></div>
        
        <Link 
          style={getLinkStyle("/admin")} 
          to="/admin"
          onMouseEnter={(e) => handleLinkHover(e, location.pathname === "/admin")}
          onMouseLeave={(e) => handleLinkLeave(e, location.pathname === "/admin")}
        >
          📊 Dashboard
        </Link>
        
        <Link 
          style={getLinkStyle("/admin/users")} 
          to="/admin/users"
          onMouseEnter={(e) => handleLinkHover(e, location.pathname === "/admin/users")}
          onMouseLeave={(e) => handleLinkLeave(e, location.pathname === "/admin/users")}
        >
          👥 Users
        </Link>
        
        <Link 
          style={getLinkStyle("/admin/service-management")} 
          to="/admin/service-management"
          onMouseEnter={(e) => handleLinkHover(e, location.pathname === "/admin/service-management")}
          onMouseLeave={(e) => handleLinkLeave(e, location.pathname === "/admin/service-management")}
        >
          🛠️ Services
        </Link>
        
        <Link 
          style={getLinkStyle("/admin/add-project")} 
          to="/admin/add-project"
          onMouseEnter={(e) => handleLinkHover(e, location.pathname === "/admin/add-project")}
          onMouseLeave={(e) => handleLinkLeave(e, location.pathname === "/admin/add-project")}
        >
          ➕ Add Project
        </Link>
        
        <Link 
          style={getLinkStyle("/admin/add-blog")} 
          to="/admin/add-blog"
          onMouseEnter={(e) => handleLinkHover(e, location.pathname === "/admin/add-blog")}
          onMouseLeave={(e) => handleLinkLeave(e, location.pathname === "/admin/add-blog")}
        >
          ✏️ Add Blog
        </Link>
        
        <div style={dividerStyle}></div>
        
        <Link 
          style={{
            ...getLinkStyle("/"),
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }} 
          to="/"
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)"
            e.target.style.color = "#fef2f2"
            e.target.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)"
            e.target.style.color = "#fecaca"
            e.target.style.transform = "translateY(0)"
          }}
        >
          🏠 Back to Site
        </Link>

        <div style={dividerStyle}></div>

        {/* User Menu */}
        <div 
          style={userMenuStyle}
          onMouseLeave={() => setShowLogoutMenu(false)}
        >
          <div 
            style={userAvatarStyle}
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)"
              e.target.style.transform = "scale(1.05)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)"
              e.target.style.transform = "scale(1)"
            }}
          >
            {getUserInitials()}
          </div>

          <div style={dropdownStyle}>
            <div style={{
              ...dropdownItemStyle,
              color: "#374151",
              cursor: "default",
              background: "rgba(0,0,0,0.02)"
            }}>
              <div style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "600"
              }}>
                {getUserInitials()}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                  {user?.displayName || 'Admin'}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {user?.email}
                </div>
              </div>
            </div>

            <div style={{
              height: "1px",
              background: "rgba(0,0,0,0.1)",
              margin: "0.5rem 0"
            }}></div>

            <div 
              style={{
                ...dropdownItemStyle,
                color: "#dc2626"
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(220, 38, 38, 0.1)"
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent"
              }}
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}