import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

export default function AdminNavbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(!(currentScrollY > lastScrollY && currentScrollY > 100))
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

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

  const dividerStyle = {
    width: "1px",
    height: "2rem",
    background: "rgba(255,255,255,0.3)",
    margin: "0 0.5rem"
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
          onMouseEnter={(e) => {
            if (location.pathname !== "/admin") {
              e.target.style.background = "rgba(255, 255, 255, 0.15)"
              e.target.style.color = "#fef2f2"
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/admin") {
              e.target.style.background = "transparent"
              e.target.style.color = "#fecaca"
            }
          }}
        >
          📊 Dashboard
        </Link>
        
        <Link 
          style={getLinkStyle("/admin/service-management")} 
          to="/admin/service-management"
          onMouseEnter={(e) => {
            if (location.pathname !== "/admin/service-management") {
              e.target.style.background = "rgba(255, 255, 255, 0.15)"
              e.target.style.color = "#fef2f2"
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/admin/service-management") {
              e.target.style.background = "transparent"
              e.target.style.color = "#fecaca"
            }
          }}
        >
          🛠️ Services
        </Link>
        
        <Link 
          style={getLinkStyle("/admin/add-project")} 
          to="/admin/add-project"
          onMouseEnter={(e) => {
            if (location.pathname !== "/admin/add-project") {
              e.target.style.background = "rgba(255, 255, 255, 0.15)"
              e.target.style.color = "#fef2f2"
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/admin/add-project") {
              e.target.style.background = "transparent"
              e.target.style.color = "#fecaca"
            }
          }}
        >
          ➕ Add Project
        </Link>
        
        <Link 
          style={getLinkStyle("/admin/add-blog")} 
          to="/admin/add-blog"
          onMouseEnter={(e) => {
            if (location.pathname !== "/admin/add-blog") {
              e.target.style.background = "rgba(255, 255, 255, 0.15)"
              e.target.style.color = "#fef2f2"
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/admin/add-blog") {
              e.target.style.background = "transparent"
              e.target.style.color = "#fecaca"
            }
          }}
        >
          ✍️ Add Blog
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
      </div>
    </nav>
  )
}