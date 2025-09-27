import { useState, useEffect, useRef } from 'react'
import { getPublishedBlogs } from '../services/firebaseService'

export default function Blog() {
  const [showElements, setShowElements] = useState(false)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const particlesRef = useRef(null)

  const categories = ['All', 'Web Development', 'Mobile Development', 'AI/ML', 'Data Science', 'DevOps', 'UI/UX', 'Programming', 'Tech News', 'Tutorials', 'Career']

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
      
      const particleCount = 30
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.style.position = 'absolute'
        particle.style.background = 'rgba(255, 255, 255, 0.05)'
        particle.style.borderRadius = '50%'
        particle.style.pointerEvents = 'none'
        
        const size = Math.random() * 4 + 1
        particle.style.width = size + 'px'
        particle.style.height = size + 'px'
        
        particle.style.left = Math.random() * 100 + '%'
        particle.style.animation = `particle-float ${Math.random() * 15 + 20}s linear infinite`
        particle.style.animationDelay = Math.random() * 20 + 's'
        
        particlesRef.current.appendChild(particle)
      }
    }

    // Add keyframes
    const style = document.createElement('style')
    style.textContent = `
      @keyframes particle-float {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.3; }
        90% { opacity: 0.3; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
      }
      @keyframes float-slow { 
        0%,100%{ transform: translateY(0) rotate(0deg); } 
        50% { transform: translateY(-15px) rotate(3deg); } 
      }
      @keyframes pulse-glow {
        0% { text-shadow: 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2); }
        100% { text-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.3); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `
    document.head.appendChild(style)

    createParticles()
    setTimeout(() => setShowElements(true), 300)
    fetchBlogs()

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
      if (document.head.contains(style)) document.head.removeChild(style)
    }
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const blogsData = await getPublishedBlogs()
      setBlogs(blogsData)
    } catch (error) {
      console.error('Error fetching blogs:', error)
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
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const containerStyle = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0e4b99 100%)',
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
    transition: 'all 0.3s ease',
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
  }

  const LoadingCard = () => (
    <div style={{
      ...glassCardStyle,
      padding: '2rem',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite'
    }}>
      <div style={{ height: '12rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', marginBottom: '1.5rem' }}></div>
      <div style={{ height: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '1rem', width: '80%' }}></div>
      <div style={{ height: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}></div>
      <div style={{ height: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', width: '60%' }}></div>
    </div>
  )

  return (
    <div style={containerStyle}>
      {/* Particles */}
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>

      {/* Floating elements */}
      <div style={{
        position: 'absolute',
        top: '10rem',
        right: '5rem',
        width: '8rem',
        height: '8rem',
        background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        animation: 'float-slow 8s ease-in-out infinite',
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
            textShadow: '0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.3)',
            animation: 'pulse-glow 3s ease-in-out infinite alternate'
          }}>
            📝 <span style={{ color: '#6366f1' }}>Blog</span> & <span style={{ color: '#a855f7' }}>Insights</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#d1d5db',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Sharing knowledge, insights, and experiences from my journey in tech
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
              placeholder="🔍 Search blogs by title, content, or tags..."
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
            />
          </div>

          {/* Category Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={selectedCategory === category ? activeFilterStyle : filterStyle}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.background = 'rgba(99, 102, 241, 0.2)'
                    e.target.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                    e.target.style.transform = 'translateY(0)'
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out 0.4s'
        }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />)
          ) : filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog, index) => (
              <article
                key={blog.id}
                style={{
                  ...glassCardStyle,
                  padding: '0',
                  cursor: 'pointer',
                  opacity: showElements ? 1 : 0,
                  transform: showElements ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.8s ease-out ${0.4 + index * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 35px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 25px 45px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {/* Featured Image */}
                {blog.featuredImage && (
                  <div style={{
                    height: '12rem',
                    background: `url(${blog.featuredImage}) center/cover`,
                    borderRadius: '1.5rem 1.5rem 0 0',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      right: '1rem',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      📖 {blog.readTime} min read
                    </div>
                  </div>
                )}

                <div style={{ padding: '2rem' }}>
                  {/* Category Badge */}
                  <span style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                  }}>
                    {blog.category}
                  </span>

                  {/* Featured Badge */}
                  {blog.featured && (
                    <span style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginLeft: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      ⭐ Featured
                    </span>
                  )}

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: '#f8fafc',
                    lineHeight: 1.4
                  }}>
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p style={{
                    color: '#cbd5e1',
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}>
                    {blog.excerpt}
                  </p>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '1.5rem'
                    }}>
                      {blog.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#a5b4fc',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span style={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem'
                        }}>
                          +{blog.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#94a3b8',
                    fontSize: '0.875rem'
                  }}>
                    <span>📅 {formatDate(blog.createdAt)}</span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span>👁️ {blog.views || 0}</span>
                      <span>❤️ {blog.likes || 0}</span>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f8fafc' }}>
                No blogs found
              </h3>
              <p style={{ color: '#cbd5e1' }}>
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No published blogs available at the moment'}
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
            Showing {filteredBlogs.length} of {blogs.length} blog{blogs.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  )
}