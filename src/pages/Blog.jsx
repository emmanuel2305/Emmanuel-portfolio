import { useState, useEffect, useRef } from 'react'
import { 
  Heart, 
  Share, 
  MessageCircle, 
  Eye, 
  Calendar, 
  User, 
  Lock, 
  LogIn,
  Send,
  ThumbsUp,
  ExternalLink
} from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import { getUserByEmail, getPublishedBlogs, updateBlog } from '../services/firebaseService'
import GoogleAuthModal from "../components/Auth/GoogleAuthModal.jsx"

export default function Blog() {
  const [showElements, setShowElements] = useState(false)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [likedBlogs, setLikedBlogs] = useState(new Set())
  const particlesRef = useRef(null)

  const categories = ['All', 'Web Development', 'Mobile Development', 'AI/ML', 'Data Science', 'DevOps', 'UI/UX', 'Programming', 'Tech News', 'Tutorials', 'Career']

  useEffect(() => {
    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true)
      
      if (firebaseUser) {
        try {
          const userDoc = await getUserByEmail(firebaseUser.email)
          
          if (userDoc) {
            setUser(userDoc)
            // Get user's liked blogs from localStorage
            const userLikes = localStorage.getItem(`likedBlogs_${userDoc.uid}`)
            if (userLikes) {
              setLikedBlogs(new Set(JSON.parse(userLikes)))
            }
          } else {
            console.warn('User authenticated but no Firestore document found')
            setUser(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
        setLikedBlogs(new Set())
      }
      
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
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
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-15px); }
          70% { transform: translateY(-7px); }
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
    }
  }, [authLoading, user])

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

  const handleAuthSuccess = async (userData) => {
    setUser(userData)
    setShowAuthModal(false)
    // Load user's liked blogs
    const userLikes = localStorage.getItem(`likedBlogs_${userData.uid}`)
    if (userLikes) {
      setLikedBlogs(new Set(JSON.parse(userLikes)))
    }
  }

  const handleLikeBlog = async (blogId) => {
    if (!user) return
    
    try {
      const newLikedBlogs = new Set(likedBlogs)
      const blog = blogs.find(b => b.id === blogId)
      let newLikes = blog.likes || 0
      
      if (likedBlogs.has(blogId)) {
        newLikedBlogs.delete(blogId)
        newLikes = Math.max(0, newLikes - 1)
      } else {
        newLikedBlogs.add(blogId)
        newLikes += 1
      }
      
      setLikedBlogs(newLikedBlogs)
      
      // Save to localStorage
      localStorage.setItem(`likedBlogs_${user.uid}`, JSON.stringify([...newLikedBlogs]))
      
      // Update blog in state
      setBlogs(prevBlogs => 
        prevBlogs.map(b => 
          b.id === blogId ? { ...b, likes: newLikes } : b
        )
      )
      
      // Update in Firebase
      await updateBlog(blogId, { likes: newLikes })
      
    } catch (error) {
      console.error('Error updating blog likes:', error)
    }
  }

  const handleShareWhatsApp = (blog) => {
    const text = `Check out this amazing blog post: "${blog.title}" by ${user?.name || 'Developer'}\n\n${blog.excerpt}\n\nRead more at: ${window.location.origin}/blog/${blog.slug}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog)
    setShowBlogModal(true)
    
    // Update view count
    const updatedViews = (blog.views || 0) + 1
    setBlogs(prevBlogs => 
      prevBlogs.map(b => 
        b.id === blog.id ? { ...b, views: updatedViews } : b
      )
    )
    
    // Update in Firebase (fire and forget)
    updateBlog(blog.id, { views: updatedViews }).catch(console.error)
  }

  const handleAddComment = (blogId) => {
    if (!newComment.trim() || !user) return
    
    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      author: user.name,
      authorEmail: user.email,
      createdAt: new Date().toISOString(),
      likes: 0
    }
    
    setComments(prev => ({
      ...prev,
      [blogId]: [...(prev[blogId] || []), comment]
    }))
    
    setNewComment('')
    
    // Save to localStorage (in a real app, you'd save to Firebase)
    const blogComments = JSON.parse(localStorage.getItem(`comments_${blogId}`) || '[]')
    blogComments.push(comment)
    localStorage.setItem(`comments_${blogId}`, JSON.stringify(blogComments))
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date'
    
    let date
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    } else {
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

  // Loading state
  if (authLoading) {
    return (
      <div style={containerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(99, 102, 241, 0.3)',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: '#cbd5e1',
            fontSize: '1.125rem',
            fontWeight: 500
          }}>
            Loading blog...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Authentication required screen
  if (!user) {
    return (
      <>
        <div style={containerStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            flexDirection: 'column'
          }}>
            <div style={{
              ...glassCardStyle,
              padding: '3rem',
              textAlign: 'center',
              maxWidth: '500px',
              width: '100%'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #3730a3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                animation: 'bounce 2s infinite'
              }}>
                <Lock size={40} style={{ color: 'white' }} />
              </div>
              
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Join Our Community
              </h2>
              
              <p style={{
                fontSize: '1.125rem',
                color: '#cbd5e1',
                marginBottom: '2.5rem',
                lineHeight: 1.6
              }}>
                Please sign in to access our blog posts, like articles, share insights, and join the conversation with fellow developers.
              </p>
              
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #3730a3)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2.5rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  margin: '0 auto',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)'
                  e.target.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)'
                  e.target.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.3)'
                }}
              >
                <LogIn size={20} />
                Sign In to Read Blogs
              </button>
              
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '1rem',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#6366f1',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}>
                  Why sign in?
                </h4>
                <ul style={{
                  textAlign: 'left',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  margin: 0,
                  paddingLeft: '1.25rem'
                }}>
                  <li>Like and share your favorite articles</li>
                  <li>Leave comments and engage with the community</li>
                  <li>Get personalized content recommendations</li>
                  <li>Access to exclusive developer insights</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <GoogleAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    )
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
        {/* Welcome Message */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out'
        }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '9999px',
            padding: '0.75rem 1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <User size={16} style={{ color: '#6366f1' }} />
            <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.875rem' }}>
              Welcome back, {user.name}!
            </span>
          </div>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out 0.2s'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: 900,
            marginBottom: '1rem',
            textShadow: '0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.3)',
            animation: 'pulse-glow 3s ease-in-out infinite alternate'
          }}>
            <span style={{ color: '#6366f1' }}>Blog</span> & <span style={{ color: '#a855f7' }}>Insights</span>
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
                  <h3 
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      marginBottom: '1rem',
                      color: '#f8fafc',
                      lineHeight: 1.4,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewBlog(blog)}
                  >
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

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLikeBlog(blog.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: likedBlogs.has(blog.id) ? '#ef4444' : '#94a3b8',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.875rem'
                        }}
                        onMouseEnter={(e) => {
                          if (!likedBlogs.has(blog.id)) {
                            e.target.style.color = '#ef4444'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!likedBlogs.has(blog.id)) {
                            e.target.style.color = '#94a3b8'
                          }
                        }}
                      >
                        <Heart 
                          size={16} 
                          fill={likedBlogs.has(blog.id) ? 'currentColor' : 'none'} 
                        />
                        {blog.likes || 0}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShareWhatsApp(blog)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.875rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#25d366'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#94a3b8'
                        }}
                      >
                        <Share size={16} />
                        Share
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewBlog(blog)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.875rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#6366f1'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#94a3b8'
                        }}
                      >
                        <MessageCircle size={16} />
                        Comment
                      </button>
                    </div>

                    <button
                      onClick={() => handleViewBlog(blog)}
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #3730a3)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)'
                        e.target.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      Read More
                      <ExternalLink size={14} />
                    </button>
                  </div>

                  {/* Meta Info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} />
                      {formatDate(blog.createdAt)}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={14} /> {blog.views || 0}
                      </span>
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

      {/* Blog Modal */}
      {showBlogModal && selectedBlog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            ...glassCardStyle,
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '0',
            animation: 'slide-up 0.4s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              position: 'sticky',
              top: 0,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              zIndex: 10
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.3
                  }}>
                    {selectedBlog.title}
                  </h2>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#94a3b8'
                  }}>
                    <span>{formatDate(selectedBlog.createdAt)}</span>
                    <span>•</span>
                    <span>{selectedBlog.readTime} min read</span>
                    <span>•</span>
                    <span>{selectedBlog.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowBlogModal(false)
                    setSelectedBlog(null)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#f8fafc'
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#94a3b8'
                    e.target.style.background = 'none'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {selectedBlog.featuredImage && (
              <div style={{
                height: '300px',
                background: `url(${selectedBlog.featuredImage}) center/cover`,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
                }} />
              </div>
            )}

            {/* Blog Content */}
            <div style={{ padding: '2rem' }}>
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={() => handleLikeBlog(selectedBlog.id)}
                    style={{
                      background: likedBlogs.has(selectedBlog.id) 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${likedBlogs.has(selectedBlog.id) ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '9999px',
                      padding: '0.75rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: likedBlogs.has(selectedBlog.id) ? '#ef4444' : '#cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <Heart 
                      size={16} 
                      fill={likedBlogs.has(selectedBlog.id) ? 'currentColor' : 'none'} 
                    />
                    {likedBlogs.has(selectedBlog.id) ? 'Liked' : 'Like'} ({selectedBlog.likes || 0})
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(selectedBlog)}
                    style={{
                      background: 'rgba(37, 211, 102, 0.1)',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      borderRadius: '9999px',
                      padding: '0.75rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#25d366',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = '0 8px 20px rgba(37, 211, 102, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <Share size={16} />
                    Share on WhatsApp
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#94a3b8',
                  fontSize: '0.875rem'
                }}>
                  <Eye size={16} />
                  {selectedBlog.views || 0} views
                </div>
              </div>

              {/* Blog Content */}
              <div style={{
                color: '#e2e8f0',
                lineHeight: 1.7,
                fontSize: '1.1rem',
                marginBottom: '3rem'
              }}>
                {selectedBlog.content.split('\n').map((paragraph, index) => (
                  <p key={index} style={{ 
                    marginBottom: '1.5rem',
                    textAlign: 'justify'
                  }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h4 style={{
                    color: '#6366f1',
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                  }}>
                    Tags
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    {selectedBlog.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: '#a5b4fc',
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '2rem'
              }}>
                <h4 style={{
                  color: '#f8fafc',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <MessageCircle size={20} />
                  Comments ({comments[selectedBlog.id]?.length || 0})
                </h4>

                {/* Add Comment */}
                <div style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this blog post..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(selectedBlog.id)}
                    disabled={!newComment.trim()}
                    style={{
                      background: !newComment.trim() 
                        ? 'rgba(107, 114, 128, 0.5)' 
                        : 'linear-gradient(135deg, #6366f1, #3730a3)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: !newComment.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Send size={14} />
                    Post Comment
                  </button>
                </div>

                {/* Comments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {comments[selectedBlog.id]?.length > 0 ? (
                    comments[selectedBlog.id].map(comment => (
                      <div
                        key={comment.id}
                        style={{
                          padding: '1.5rem',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '1rem',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.75rem'
                        }}>
                          <div>
                            <h5 style={{
                              color: '#6366f1',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              margin: 0
                            }}>
                              {comment.author}
                            </h5>
                            <p style={{
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                              margin: '0.25rem 0 0 0'
                            }}>
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem'
                            }}
                          >
                            <ThumbsUp size={12} />
                            {comment.likes}
                          </button>
                        </div>
                        <p style={{
                          color: '#e2e8f0',
                          lineHeight: 1.6,
                          margin: 0
                        }}>
                          {comment.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#94a3b8'
                    }}>
                      <MessageCircle size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}