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
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Reply
} from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import { 
  getUserByEmail, 
  getPublishedBlogs, 
  toggleBlogLike,
  incrementBlogView,
  addComment,
  getCommentsByBlogId,
  addReply,
  toggleCommentLike,
  deleteComment,
  updateComment
} from '../services/firebaseService'
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
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [editText, setEditText] = useState('')
  const particlesRef = useRef(null)

  const categories = ['All', 'Web Development', 'Mobile Development', 'AI/ML', 'Data Science', 'DevOps', 'UI/UX', 'Programming', 'Tech News', 'Tutorials', 'Career']

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true)
      
      if (firebaseUser) {
        try {
          const userDoc = await getUserByEmail(firebaseUser.email)
          if (userDoc) {
            setUser(userDoc)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      const link = document.createElement('link')
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      document.body.style.fontFamily = 'Inter, sans-serif'
      document.body.style.background = '#0a0a0a'
      document.body.style.color = '#f0f0f0'
      document.body.style.margin = '0'
      document.body.style.padding = '0'
      document.body.style.scrollBehavior = 'smooth'
      document.body.style.overflowX = 'hidden'

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

  const loadComments = async (blogId) => {
    try {
      const commentsData = await getCommentsByBlogId(blogId)
      setComments(prev => ({
        ...prev,
        [blogId]: commentsData
      }))
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleAuthSuccess = async (userData) => {
    setUser(userData)
    setShowAuthModal(false)
  }

  const handleLikeBlog = async (blogId, e) => {
    e?.stopPropagation()
    if (!user) return
    
    try {
      const isLiked = await toggleBlogLike(blogId, user.uid)
      
      setBlogs(prevBlogs => 
        prevBlogs.map(b => {
          if (b.id === blogId) {
            const likedBy = b.likedBy || []
            const newLikedBy = isLiked 
              ? [...likedBy, user.uid]
              : likedBy.filter(id => id !== user.uid)
            return {
              ...b,
              likes: isLiked ? (b.likes || 0) + 1 : Math.max(0, (b.likes || 0) - 1),
              likedBy: newLikedBy
            }
          }
          return b
        })
      )

      if (selectedBlog?.id === blogId) {
        const blog = blogs.find(b => b.id === blogId)
        if (blog) {
          const likedBy = blog.likedBy || []
          const newLikedBy = isLiked 
            ? [...likedBy, user.uid]
            : likedBy.filter(id => id !== user.uid)
          setSelectedBlog({
            ...blog,
            likes: isLiked ? (blog.likes || 0) + 1 : Math.max(0, (blog.likes || 0) - 1),
            likedBy: newLikedBy
          })
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleShareWhatsApp = (blog) => {
    const text = `Check out this blog: "${blog.title}"\n\n${blog.excerpt}\n\nRead more at: ${window.location.origin}/blog/${blog.slug}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleViewBlog = async (blog) => {
    setSelectedBlog(blog)
    setShowBlogModal(true)
    
    if (user) {
      await incrementBlogView(blog.id, user.uid)
      setBlogs(prevBlogs => 
        prevBlogs.map(b => 
          b.id === blog.id ? { ...b, views: (b.views || 0) + 1 } : b
        )
      )
    }

    await loadComments(blog.id)
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !selectedBlog) return
    
    try {
      await addComment(selectedBlog.id, {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        userPhoto: user.photoURL || null,
        text: newComment.trim(),
        parentId: null
      })
      
      setNewComment('')
      await loadComments(selectedBlog.id)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleAddReply = async (commentId) => {
    if (!replyText.trim() || !user || !selectedBlog) return
    
    try {
      await addReply(selectedBlog.id, commentId, {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        userPhoto: user.photoURL || null,
        text: replyText.trim()
      })
      
      setReplyText('')
      setReplyingTo(null)
      await loadComments(selectedBlog.id)
    } catch (error) {
      console.error('Error adding reply:', error)
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!user) return
    
    try {
      await toggleCommentLike(commentId, user.uid)
      await loadComments(selectedBlog.id)
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!user) return
    
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId)
        await loadComments(selectedBlog.id)
      } catch (error) {
        console.error('Error deleting comment:', error)
      }
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return
    
    try {
      await updateComment(commentId, editText.trim())
      setEditingComment(null)
      setEditText('')
      await loadComments(selectedBlog.id)
    } catch (error) {
      console.error('Error editing comment:', error)
    }
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

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return ''
    
    let date
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    } else {
      date = new Date(timestamp)
    }
    
    const seconds = Math.floor((new Date() - date) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return formatDate(timestamp)
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
          <p style={{ color: '#cbd5e1', fontSize: '1.125rem', fontWeight: 500 }}>Loading blog...</p>
        </div>
      </div>
    )
  }

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
                Sign in to read blogs, like posts, and join the conversation with fellow developers.
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
              >
                <LogIn size={20} />
                Sign In to Read Blogs
              </button>
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

  const CommentItem = ({ comment, isReply = false }) => {
    const isLiked = comment.likedBy?.includes(user.uid)
    const isAuthor = comment.userId === user.uid

    return (
      <div style={{
        padding: isReply ? '1rem' : '1.5rem',
        background: isReply ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.1)',
        marginLeft: isReply ? '3rem' : '0'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: comment.userPhoto 
              ? `url(${comment.userPhoto}) center/cover` 
              : 'linear-gradient(135deg, #6366f1, #3730a3)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600
          }}>
            {!comment.userPhoto && comment.userName?.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <h5 style={{
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  margin: 0
                }}>
                  {comment.userName}
                </h5>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  {formatTimeAgo(comment.createdAt)}
                  {comment.edited && <span style={{ marginLeft: '0.5rem' }}>(edited)</span>}
                </p>
              </div>

              {isAuthor && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setEditingComment(comment.id)
                      setEditText(comment.text)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366f1',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {editingComment === comment.id ? (
              <div style={{ marginTop: '0.5rem' }}>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '60px',
                    marginBottom: '0.5rem',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    style={{
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null)
                      setEditText('')
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#cbd5e1',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p style={{
                  color: '#e2e8f0',
                  lineHeight: 1.6,
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.875rem'
                }}>
                  {comment.text}
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isLiked ? '#ef4444' : '#94a3b8',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                    {comment.likes || 0}
                  </button>

                  {!isReply && (
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      <Reply size={14} />
                      Reply
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {!isReply && replyingTo === comment.id && (
          <div style={{ marginTop: '1rem', marginLeft: '3rem' }}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#f8fafc',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '60px',
                marginBottom: '0.5rem',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleAddReply(comment.id)}
                style={{
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null)
                  setReplyText('')
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#cbd5e1',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isReply && comment.replies?.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          opacity: showElements ? 1 : 0,
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

        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          opacity: showElements ? 1 : 0,
          transition: 'all 0.8s ease-out 0.2s'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: 900,
            marginBottom: '1rem',
            textShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
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
            Sharing knowledge, insights, and experiences from the tech world
          </p>
        </div>

        <div style={{
          marginBottom: '3rem',
          opacity: showElements ? 1 : 0,
          transition: 'all 0.8s ease-out 0.2s'
        }}>
          <div style={{
            ...glassCardStyle,
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <input
              type="text"
              placeholder="🔍 Search blogs..."
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
                style={{
                  background: selectedCategory === category 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: selectedCategory === category ? 'white' : '#e2e8f0',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: selectedCategory === category ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: selectedCategory === category ? '0 10px 25px rgba(102, 126, 234, 0.3)' : 'none'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          opacity: showElements ? 1 : 0,
          transition: 'all 0.8s ease-out 0.4s'
        }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} style={{
                ...glassCardStyle,
                padding: '2rem',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite'
              }}>
                <div style={{ height: '12rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', marginBottom: '1.5rem' }}></div>
                <div style={{ height: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '1rem', width: '80%' }}></div>
                <div style={{ height: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}></div>
              </div>
            ))
          ) : filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog, index) => {
              const isLiked = blog.likedBy?.includes(user.uid)
              return (
                <article
                  key={blog.id}
                  style={{
                    ...glassCardStyle,
                    padding: '0',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleViewBlog(blog)}
                >
                  {blog.featuredImage && (
                    <div style={{
                      height: '12rem',
                      background: `url(${blog.featuredImage}) center/cover`,
                      borderRadius: '1.5rem 1.5rem 0 0'
                    }}>
                      <div style={{
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1rem',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem'
                      }}>
                        📖 {blog.readTime} min read
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '2rem' }}>
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

                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      marginBottom: '1rem',
                      color: '#f8fafc',
                      lineHeight: 1.4
                    }}>
                      {blog.title}
                    </h3>

                    <p style={{
                      color: '#cbd5e1',
                      marginBottom: '1.5rem',
                      lineHeight: 1.6,
                      fontSize: '0.95rem'
                    }}>
                      {blog.excerpt}
                    </p>

                    {blog.tags && blog.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        {blog.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#a5b4fc',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={(e) => handleLikeBlog(blog.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: isLiked ? '#ef4444' : '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
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
                            fontSize: '0.875rem'
                          }}
                        >
                          <Share size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        <Eye size={14} /> {blog.views || 0}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })
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
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {!loading && (
          <div style={{
            textAlign: 'center',
            marginTop: '3rem',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            Showing {filteredBlogs.length} of {blogs.length} blog{blogs.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

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
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{
            ...glassCardStyle,
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '0'
          }}>
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
                alignItems: 'flex-start'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {selectedBlog.title}
                  </h2>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#94a3b8'
                  }}>
                    <span>{formatDate(selectedBlog.createdAt)}</span>
                    <span>•</span>
                    <span>{selectedBlog.readTime} min read</span>
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
                    padding: '0.5rem'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedBlog.featuredImage && (
              <div style={{
                height: '300px',
                background: `url(${selectedBlog.featuredImage}) center/cover`
              }} />
            )}

            <div style={{ padding: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={(e) => handleLikeBlog(selectedBlog.id, e)}
                    style={{
                      background: selectedBlog.likedBy?.includes(user.uid) 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedBlog.likedBy?.includes(user.uid) ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '9999px',
                      padding: '0.75rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: selectedBlog.likedBy?.includes(user.uid) ? '#ef4444' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Heart 
                      size={16} 
                      fill={selectedBlog.likedBy?.includes(user.uid) ? 'currentColor' : 'none'} 
                    />
                    {selectedBlog.likedBy?.includes(user.uid) ? 'Liked' : 'Like'} ({selectedBlog.likes || 0})
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
                      fontSize: '0.875rem'
                    }}
                  >
                    <Share size={16} />
                    Share
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

              <div style={{
                color: '#e2e8f0',
                lineHeight: 1.7,
                fontSize: '1.1rem',
                marginBottom: '3rem'
              }}>
                {selectedBlog.content.split('\n').map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: '1.5rem' }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '1rem'
                }}>
                  <h4 style={{ color: '#6366f1', marginBottom: '1rem' }}>Tags</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {selectedBlog.tags.map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#a5b4fc',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

                <div style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '1rem'
                }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
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
                    onClick={handleAddComment}
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
                      cursor: !newComment.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Send size={14} />
                    Post Comment
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {comments[selectedBlog.id]?.length > 0 ? (
                    comments[selectedBlog.id]
                      .filter(c => !c.parentId)
                      .map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
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

      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
<style>{`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style>

    </div>
  )
}