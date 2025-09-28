import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addBlog, getBlogs, updateBlog, deleteBlog } from '../services/firebaseService'

export default function AddBlog() {
  const navigate = useNavigate()
  const [showElements, setShowElements] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('add') // 'add' or 'manage'
  const [existingBlogs, setExistingBlogs] = useState([])
  const [filteredBlogs, setFilteredBlogs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingBlog, setEditingBlog] = useState(null)
  const [loadingBlogs, setLoadingBlogs] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Web Development',
    tags: [],
    imageUrl: '',
    imageFile: null,
    imageData: null,
    featured: false,
    published: true,
    readTime: 5
  })

  const categories = [
    'Web Development', 'Mobile Development', 'AI/ML', 'Data Science',
    'DevOps', 'UI/UX', 'Programming', 'Tech News', 'Tutorials', 'Career', 'Other'
  ]

  const popularTags = [
    'React', 'JavaScript', 'Python', 'Node.js', 'CSS', 'HTML', 'TypeScript',
    'Vue.js', 'Angular', 'MongoDB', 'SQL', 'API', 'Frontend', 'Backend',
    'Full-stack', 'Tutorial', 'Tips', 'Best Practices', 'Performance',
    'Security', 'Testing', 'Docker', 'AWS', 'Firebase', 'Laravel', 'PHP'
  ]

  useEffect(() => {
    document.body.style.fontFamily = 'Inter, sans-serif'
    document.body.style.background = '#0f0f0f'
    document.body.style.color = '#f0f0f0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'

    setTimeout(() => setShowElements(true), 300)
    if (activeTab === 'manage') {
      loadBlogs()
    }
  }, [activeTab])

  useEffect(() => {
    filterBlogs()
  }, [existingBlogs, searchTerm, statusFilter])

  const loadBlogs = async () => {
    try {
      setLoadingBlogs(true)
      const blogs = await getBlogs()
      setExistingBlogs(blogs)
    } catch (error) {
      console.error('Error loading blogs:', error)
    } finally {
      setLoadingBlogs(false)
    }
  }

  const filterBlogs = () => {
    let filtered = existingBlogs

    // Filter by status
    if (statusFilter === 'published') {
      filtered = filtered.filter(blog => blog.published === true)
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(blog => blog.published === false)
    } else if (statusFilter === 'featured') {
      filtered = filtered.filter(blog => blog.featured === true)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(blog =>
        blog.title?.toLowerCase().includes(searchLower) ||
        blog.excerpt?.toLowerCase().includes(searchLower) ||
        blog.category?.toLowerCase().includes(searchLower) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    setFilteredBlogs(filtered)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Web Development',
      tags: [],
      imageUrl: '',
      imageFile: null,
      imageData: null,
      featured: false,
      published: true,
      readTime: 5
    })
    setEditingBlog(null)
  }

  const loadBlogForEditing = (blog) => {
    setFormData({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || 'Web Development',
      tags: blog.tags || [],
      imageUrl: blog.featuredImage || '',
      imageFile: null,
      imageData: blog.featuredImage || null,
      featured: blog.featured || false,
      published: blog.published || false,
      readTime: blog.readTime || 5
    })
    setEditingBlog(blog)
    setActiveTab('add')
  }

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await deleteBlog(blogId)
        await loadBlogs()
        alert('Blog post deleted successfully!')
      } catch (error) {
        console.error('Error deleting blog:', error)
        alert('Failed to delete blog post.')
      }
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imageData: e.target.result,
          imageUrl: ''
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imageData: null,
      imageUrl: ''
    }))
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (name === 'imageUrl' && value) {
      setFormData(prev => ({
        ...prev,
        imageFile: null,
        imageData: null
      }))
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    }
  }

  const handleTagChange = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const addCustomTag = (customTag) => {
    const tag = customTag.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / wordsPerMinute))
  }

  const handleContentChange = (e) => {
    const content = e.target.value
    const readTime = calculateReadTime(content)
    setFormData(prev => ({
      ...prev,
      content,
      readTime
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        featured: formData.featured,
        published: formData.published,
        readTime: formData.readTime,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        featuredImage: formData.imageData || formData.imageUrl || null,
        imageType: formData.imageFile ? formData.imageFile.type : (formData.imageUrl ? 'url' : null)
      }

      if (editingBlog) {
        await updateBlog(editingBlog.id, blogData)
        alert('Blog post updated successfully!')
      } else {
        await addBlog(blogData)
        alert('Blog post added successfully!')
      }
      
      resetForm()
      if (activeTab === 'manage') {
        await loadBlogs()
      }
    } catch (error) {
      console.error('Error saving blog:', error)
      alert('Failed to save blog post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const containerStyle = {
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0b1a 25%, #2d1b2d 50%, #1a0b1a 75%, #0f0f0f 100%)',
    minHeight: '100vh',
    padding: '6rem 1.5rem 2rem',
    position: 'relative'
  }

  const glassCardStyle = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 45px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '3rem',
    maxWidth: '900px',
    margin: '0 auto'
  }

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f8fafc',
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
    boxSizing: 'border-box'
  }

  const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#e2e8f0',
    fontWeight: 600,
    fontSize: '1rem'
  }

  const tagStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  }

  const selectedTagStyle = {
    ...tagStyle,
    background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    borderColor: '#ef4444',
    color: 'white'
  }

  const tabButtonStyle = (isActive) => ({
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.2)',
    background: isActive ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'rgba(255,255,255,0.05)',
    color: isActive ? 'white' : '#e2e8f0',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.3s ease'
  })

  return (
    <div style={containerStyle}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        opacity: showElements ? 1 : 0,
        transform: showElements ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease-out'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            Blog Management
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.25rem' }}>
            Create new posts and manage your existing content
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          <button
            onClick={() => setActiveTab('add')}
            style={tabButtonStyle(activeTab === 'add')}
            onMouseEnter={(e) => {
              if (activeTab !== 'add') {
                e.target.style.background = 'rgba(255,255,255,0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'add') {
                e.target.style.background = 'rgba(255,255,255,0.05)'
              }
            }}
          >
            {editingBlog ? '✏️ Edit Blog' : '✍️ Add New Blog'}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            style={tabButtonStyle(activeTab === 'manage')}
            onMouseEnter={(e) => {
              if (activeTab !== 'manage') {
                e.target.style.background = 'rgba(255,255,255,0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'manage') {
                e.target.style.background = 'rgba(255,255,255,0.05)'
              }
            }}
          >
            📚 Manage Blogs
          </button>
        </div>

        {/* Add/Edit Blog Form */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} style={glassCardStyle}>
            {editingBlog && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#60a5fa', margin: 0, fontWeight: 600 }}>
                  📝 Editing: {editingBlog.title}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setActiveTab('add')
                  }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Cancel Edit
                </button>
              </div>
            )}

            {/* Basic Info */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                📝 Blog Details
              </h3>
              
              <label style={labelStyle}>Blog Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter an engaging blog title"
                required
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />

              <label style={labelStyle}>Excerpt/Summary *</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                style={textareaStyle}
                placeholder="Brief summary of your blog post (will be shown in blog list)"
                required
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  >
                    {categories.map(category => (
                      <option key={category} value={category} style={{ background: '#1f2937', color: '#f8fafc' }}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ width: '200px' }}>
                  <label style={labelStyle}>Read Time</label>
                  <div style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}>
                    📖 {formData.readTime} min read
                  </div>
                </div>
              </div>

              <label style={labelStyle}>Featured Image</label>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontSize: '0.875rem', color: '#94a3b8' }}>
                      Upload Image File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{
                        ...inputStyle,
                        padding: '0.75rem',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    height: '3.5rem',
                    minWidth: '30px',
                    justifyContent: 'center'
                  }}>
                    OR
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontSize: '0.875rem', color: '#94a3b8' }}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="https://example.com/image.jpg"
                      onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                    />
                  </div>
                </div>

                {/* Image Preview */}
                {(formData.imageData || formData.imageUrl) && (
                  <div style={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: 600 }}>
                        📸 Image Preview
                      </span>
                      <button
                        type="button"
                        onClick={removeImage}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '0.5rem',
                          color: '#ef4444',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <img
                      src={formData.imageData || formData.imageUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'block'
                      }}
                    />
                    <div style={{ 
                      display: 'none',
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#ef4444',
                      fontSize: '0.875rem'
                    }}>
                      Failed to load image
                    </div>
                    {formData.imageFile && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.75rem', 
                        color: '#94a3b8' 
                      }}>
                        File: {formData.imageFile.name} ({(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                📖 Content
              </h3>
              
              <label style={labelStyle}>Blog Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleContentChange}
                style={{
                  ...textareaStyle,
                  minHeight: '400px',
                  fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                }}
                placeholder="Write your blog content here. You can use markdown formatting..."
                required
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem' }}>
                🏷️ Tags
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {popularTags.map(tag => (
                  <div
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    style={formData.tags.includes(tag) ? selectedTagStyle : tagStyle}
                    onMouseEnter={(e) => {
                      if (!formData.tags.includes(tag)) {
                        e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                        e.target.style.borderColor = '#ef4444'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formData.tags.includes(tag)) {
                        e.target.style.background = 'rgba(255,255,255,0.05)'
                        e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>

              {formData.tags.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#6366f1', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    Selected tags:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          ...selectedTagStyle,
                          cursor: 'pointer'
                        }}
                        onClick={() => removeTag(tag)}
                        title="Click to remove"
                      >
                        {tag} ✕
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Add custom tag..."
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                    flex: 1
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomTag(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling
                    addCustomTag(input.value)
                    input.value = ''
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    minWidth: '100px',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Settings */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                ⚙️ Settings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{
                  ...labelStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      accentColor: '#ef4444'
                    }}
                  />
                  ⭐ Mark as Featured Post
                </label>

                <label style={{
                  ...labelStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      accentColor: '#ef4444'
                    }}
                  />
                  🌐 Publish immediately
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => {
                  if (editingBlog) {
                    resetForm()
                  } else {
                    navigate('/admin')
                  }
                }}
                disabled={isSubmitting}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {editingBlog ? 'Cancel Edit' : 'Cancel'}
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.excerpt || !formData.content}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: isSubmitting || !formData.title || !formData.excerpt || !formData.content
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: isSubmitting || !formData.title || !formData.excerpt || !formData.content ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
                }}
              >
                {isSubmitting ? 
                  (editingBlog ? '📝 Updating...' : '📝 Publishing...') : 
                  (editingBlog ? 
                    (formData.published ? '📝 Update Blog' : '💾 Update Draft') : 
                    (formData.published ? '🚀 Publish Blog' : '💾 Save as Draft')
                  )
                }
              </button>
            </div>
          </form>
        )}

        {/* Manage Blogs Tab */}
        {activeTab === 'manage' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Controls */}
            <div style={{
              ...glassCardStyle,
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  {/* Search */}
                  <div style={{ position: 'relative', minWidth: '300px' }}>
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Posts</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>

                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>

            {/* Blog List */}
            <div style={{
              ...glassCardStyle,
              padding: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                📚 Your Blog Posts
              </h2>

              {loadingBlogs ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  color: '#94a3b8'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(239, 68, 68, 0.3)',
                    borderTop: '4px solid #ef4444',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                  }}></div>
                  Loading your blogs...
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  color: '#94a3b8'
                }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#cbd5e1' }}>
                    No blogs found
                  </h3>
                  <p>
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your filters or search terms'
                      : 'No blog posts have been created yet'
                    }
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '1.5rem'
                }}>
                  {filteredBlogs.map((blog) => (
                    <div
                      key={blog.id}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: '1.5rem',
                        alignItems: 'start'
                      }}>
                        {/* Blog Image */}
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '0.75rem',
                          background: blog.featuredImage ? 
                            `url(${blog.featuredImage}) center/cover` : 
                            'linear-gradient(135deg, #374151, #1f2937)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          {!blog.featuredImage && (
                            <span style={{ fontSize: '2rem' }}>📝</span>
                          )}
                        </div>

                        {/* Blog Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{
                              color: '#f8fafc',
                              margin: '0 0 0.5rem 0',
                              fontSize: '1.25rem',
                              fontWeight: 600
                            }}>
                              {blog.title}
                            </h4>
                            <p style={{
                              color: '#94a3b8',
                              margin: '0 0 1rem 0',
                              fontSize: '0.875rem',
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {blog.excerpt}
                            </p>
                          </div>

                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            alignItems: 'center',
                            marginBottom: '1rem'
                          }}>
                            <div style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              background: blog.published ? 
                                'rgba(34, 197, 94, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                              border: blog.published ? 
                                '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)',
                              color: blog.published ? '#4ade80' : '#c084fc',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {blog.published ? '🌐 Published' : '📝 Draft'}
                            </div>

                            {blog.featured && (
                              <div style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                background: 'rgba(245, 158, 11, 0.2)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                color: '#fbbf24',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                ⭐ Featured
                              </div>
                            )}

                            <div style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {blog.category}
                            </div>

                            <div style={{
                              color: '#6b7280',
                              fontSize: '0.75rem'
                            }}>
                              📖 {blog.readTime || 5} min read
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                          }}>
                            {blog.tags && blog.tags.slice(0, 4).map((tag, index) => (
                              <span
                                key={index}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: '#cbd5e1',
                                  fontSize: '0.75rem'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                            {blog.tags && blog.tags.length > 4 && (
                              <span style={{
                                color: '#9ca3af',
                                fontSize: '0.75rem'
                              }}>
                                +{blog.tags.length - 4} more
                              </span>
                            )}
                          </div>

                          <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}>
                            Created: {formatDate(blog.createdAt)}
                            {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                              <span> • Updated: {formatDate(blog.updatedAt)}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}>
                          <button
                            onClick={() => loadBlogForEditing(blog)}
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '0.5rem',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#60a5fa',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              minWidth: '100px',
                              justifyContent: 'center'
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => handleDelete(blog.id)}
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '0.5rem',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#f87171',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              minWidth: '100px',
                              justifyContent: 'center'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}