import { useState, useEffect, useRef } from 'react'
import { getProjects } from '../services/firebaseService'

export default function Project() {
  const [showElements, setShowElements] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTech, setSelectedTech] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const particlesRef = useRef(null)

  const techStack = ['All', 'React', 'Laravel', 'Python', 'JavaScript', 'Node.js', 'AI/ML', 'Mobile', 'Web App', 'API', 'Full Stack']

  useEffect(() => {
    // Add Google Fonts and global styles
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Set body styles
    document.body.style.fontFamily = 'Inter, sans-serif'
    document.body.style.background = '#0a0a0a'
    document.body.style.color = '#f0f0f0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.scrollBehavior = 'smooth'
    document.body.style.overflowX = 'hidden'

    // Create particles
    const createParticles = () => {
      if (!particlesRef.current) return
      
      const particleCount = 35
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.style.position = 'absolute'
        particle.style.background = 'rgba(255, 255, 255, 0.06)'
        particle.style.borderRadius = '50%'
        particle.style.pointerEvents = 'none'
        
        const size = Math.random() * 5 + 2
        particle.style.width = size + 'px'
        particle.style.height = size + 'px'
        
        particle.style.left = Math.random() * 100 + '%'
        particle.style.animation = `particle-float ${Math.random() * 18 + 25}s linear infinite`
        particle.style.animationDelay = Math.random() * 25 + 's'
        
        particlesRef.current.appendChild(particle)
      }
    }

    // Add keyframes
    const style = document.createElement('style')
    style.textContent = `
      @keyframes particle-float {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.4; }
        90% { opacity: 0.4; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
      }
      @keyframes float-slow { 
        0%,100%{ transform: translateY(0) rotate(0deg); } 
        50% { transform: translateY(-20px) rotate(5deg); } 
      }
      @keyframes float-slower { 
        0%,100%{ transform: translateY(0) rotate(0deg); } 
        50% { transform: translateY(-12px) rotate(-3deg); } 
      }
      @keyframes pulse-glow {
        0% { text-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.2); }
        100% { text-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes morph {
        0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
        50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
        75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
      }
    `
    document.head.appendChild(style)

    createParticles()
    setTimeout(() => setShowElements(true), 300)
    fetchProjects()

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
      if (document.head.contains(style)) document.head.removeChild(style)
    }
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const projectsData = await getProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date'
    
    let date
    if (timestamp.seconds) {
      // Firestore timestamp
      date = new Date(timestamp.seconds * 1000)
    } else {
      // ISO string or regular date
      date = new Date(timestamp)
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  const filteredProjects = projects.filter(project => {
    const matchesTech = selectedTech === 'All' || 
                       project.technologies?.some(tech => tech.toLowerCase().includes(selectedTech.toLowerCase())) ||
                       project.category?.toLowerCase().includes(selectedTech.toLowerCase())
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesTech && matchesSearch
  })

  const containerStyle = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0b1a 25%, #2d1b2d 50%, #1a0b1a 75%, #0a0a0a 100%)',
    minHeight: '100vh',
    padding: '6rem 1.5rem 2rem',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '-7rem'
  }

  const glassCardStyle = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 45px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.4s ease',
    position: 'relative',
    overflow: 'hidden'
  }

  const filterStyle = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#e2e8f0',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }

  const activeFilterStyle = {
    ...filterStyle,
    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(168, 85, 247, 0.3)'
  }

  const LoadingCard = () => (
    <div style={{
      ...glassCardStyle,
      padding: '0',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite'
    }}>
      <div style={{ height: '14rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1.5rem 1.5rem 0 0' }}></div>
      <div style={{ padding: '2rem' }}>
        <div style={{ height: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '1rem', width: '80%' }}></div>
        <div style={{ height: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}></div>
        <div style={{ height: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', width: '60%' }}></div>
      </div>
    </div>
  )

  return (
    <div style={containerStyle}>
      {/* Particles */}
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>

      {/* Floating elements */}
      <div style={{
        position: 'absolute',
        top: '8rem',
        left: '3rem',
        width: '12rem',
        height: '12rem',
        background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.1))',
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        animation: 'morph 10s ease-in-out infinite, float-slow 8s ease-in-out infinite',
        opacity: 0.4
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '8rem',
        right: '4rem',
        width: '10rem',
        height: '10rem',
        background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.08), rgba(139, 92, 246, 0.08))',
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        animation: 'morph 12s ease-in-out infinite, float-slower 10s ease-in-out infinite',
        animationDelay: '-5s',
        opacity: 0.3
      }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: 900,
            marginBottom: '1rem',
            textShadow: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
            animation: 'pulse-glow 3s ease-in-out infinite alternate'
          }}>
            🚀 <span style={{ color: '#a855f7' }}>Projects</span> & <span style={{ color: '#7c3aed' }}>Work</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#d1d5db',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Showcasing innovative solutions and creative implementations
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{
          marginBottom: '3rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out 0.2s'
        }}>
          {/* Search Bar */}
          <div style={{
            ...glassCardStyle,
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <input
              type="text"
              placeholder="🔍 Search projects by title, description, or technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#f8fafc',
                fontSize: '1rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#a855f7'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
          </div>

          {/* Tech Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            {techStack.map(tech => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                style={selectedTech === tech ? activeFilterStyle : filterStyle}
                onMouseEnter={(e) => {
                  if (selectedTech !== tech) {
                    e.target.style.background = 'rgba(168, 85, 247, 0.2)'
                    e.target.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTech !== tech) {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                    e.target.style.transform = 'translateY(0)'
                  }
                }}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '2.5rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out 0.4s'
        }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />)
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <article
                key={project.id}
                style={{
                  ...glassCardStyle,
                  padding: '0',
                  cursor: 'pointer',
                  opacity: showElements ? 1 : 0,
                  transform: showElements ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.8s ease-out ${0.4 + index * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 40px 70px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 25px 45px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {/* Project Image/Preview */}
                <div style={{
                  height: '14rem',
                  background: project.image 
                    ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${project.image}) center/cover`
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(139, 92, 246, 0.3))',
                  borderRadius: '1.5rem 1.5rem 0 0',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {!project.image && (
                    <div style={{
                      fontSize: '3rem',
                      opacity: 0.7
                    }}>
                      🚀
                    </div>
                  )}
                  
                  {project.status && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: project.status === 'completed' 
                        ? 'rgba(34, 197, 94, 0.9)' 
                        : project.status === 'in-progress'
                        ? 'rgba(251, 191, 36, 0.9)'
                        : 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {project.status.replace('-', ' ')}
                    </div>
                  )}
                  
                  {project.featured && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      ⭐ Featured
                    </div>
                  )}
                </div>

                <div style={{ padding: '2rem' }}>
                  {/* Category Badge */}
                  {project.category && (
                    <span style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '1rem'
                    }}>
                      {project.category}
                    </span>
                  )}

                  {/* Project Title */}
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: '#f8fafc',
                    lineHeight: 1.4
                  }}>
                    {project.title || 'Untitled Project'}
                  </h3>

                  {/* Description */}
                  <p style={{
                    color: '#cbd5e1',
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}>
                    {project.description || 'No description available'}
                  </p>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '1.5rem'
                    }}>
                      {project.technologies.slice(0, 4).map(tech => (
                        <span
                          key={tech}
                          style={{
                            background: 'rgba(168, 85, 247, 0.1)',
                            color: '#c4b5fd',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            border: '1px solid rgba(168, 85, 247, 0.2)'
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span style={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem'
                        }}>
                          +{project.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Project Links */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap'
                  }}>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)'
                          e.target.style.boxShadow = '0 5px 15px rgba(168, 85, 247, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        🌐 Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: '#e2e8f0',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          border: '1px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.2)'
                          e.target.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.1)'
                          e.target.style.transform = 'translateY(0)'
                        }}
                      >
                        📁 Code
                      </a>
                    )}
                    {project.demoUrl && project.demoUrl !== project.liveUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#93c5fd',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          transition: 'all 0.3s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.2)'
                          e.target.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.1)'
                          e.target.style.transform = 'translateY(0)'
                        }}
                      >
                        🎯 Demo
                      </a>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <span>📅 {formatDate(project.createdAt)}</span>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {project.views && <span>👁️ {project.views}</span>}
                      {project.stars && <span>⭐ {project.stars}</span>}
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem 2rem',
              ...glassCardStyle
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f8fafc' }}>
                No projects found
              </h3>
              <p style={{ color: '#cbd5e1' }}>
                {searchTerm || selectedTech !== 'All' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No projects available at the moment'}
              </p>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {!loading && (
          <div style={{
            textAlign: 'center',
            marginTop: '3rem',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            Showing {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
            {selectedTech !== 'All' && ` with "${selectedTech}"`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  )
}