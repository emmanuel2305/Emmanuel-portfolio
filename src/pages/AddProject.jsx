import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProject, getProjects, updateProject, deleteProject } from '../services/firebaseService'

export default function AddProject() {
  const navigate = useNavigate()
  const [showElements, setShowElements] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('add') // 'add' or 'manage'
  const [existingProjects, setExistingProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingProject, setEditingProject] = useState(null)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    tech: [],
    liveUrl: '',
    githubUrl: '',
    imageUrl: '',
    imageFile: null, // For file upload
    videoFile: null, // For video upload
    mediaType: 'none', // 'image', 'video', or 'none'
    featured: false,
    published: true,
    category: 'Web Development'
  })
  const [uploading, setUploading] = useState(false)

  const techOptions = [
    'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 
    'Python', 'PHP', 'Laravel', 'Django', 'MongoDB', 'MySQL', 'PostgreSQL',
    'Tailwind CSS', 'Bootstrap', 'SASS', 'HTML5', 'CSS3', 'Express.js',
    'Next.js', 'Nuxt.js', 'GraphQL', 'REST API', 'Docker', 'AWS', 'Firebase',
    'Flutter', 'React Native', 'Swift', 'Kotlin', 'Java', 'C#', '.NET',
    'Spring Boot', 'Redux', 'Vuex', 'Three.js', 'WebGL', 'Socket.io'
  ]

  const categories = [
    'Web Development', 'Mobile Development', 'Desktop Application', 
    'API Development', 'AI/ML', 'Data Science', 'Game Development', 
    'E-commerce', 'Portfolio', 'Blog', 'Dashboard', 'Other'
  ]

  useEffect(() => {
    document.body.style.fontFamily = 'Inter, sans-serif'
    document.body.style.background = '#0f0f0f'
    document.body.style.color = '#f0f0f0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'

    setTimeout(() => setShowElements(true), 300)
    if (activeTab === 'manage') {
      loadProjects()
    }
  }, [activeTab])

  useEffect(() => {
    filterProjects()
  }, [existingProjects, searchTerm, statusFilter, categoryFilter])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const projects = await getProjects()
      setExistingProjects(projects)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const filterProjects = () => {
    let filtered = existingProjects

    // Filter by status
    if (statusFilter === 'published') {
      filtered = filtered.filter(project => project.published === true)
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(project => project.published === false)
    } else if (statusFilter === 'featured') {
      filtered = filtered.filter(project => project.featured === true)
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.longDescription?.toLowerCase().includes(searchLower) ||
        project.category?.toLowerCase().includes(searchLower) ||
        project.tech?.some(tech => tech.toLowerCase().includes(searchLower))
      )
    }

    setFilteredProjects(filtered)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      longDescription: '',
      tech: [],
      liveUrl: '',
      githubUrl: '',
      imageUrl: '',
      imageFile: null,
      videoFile: null,
      mediaType: 'none',
      featured: false,
      published: true,
      category: 'Web Development'
    })
    setEditingProject(null)
    setError(null)
    setSuccess(false)
    setUploading(false)
  }

  const loadProjectForEditing = (project) => {
    setFormData({
      title: project.title || '',
      description: project.description || '',
      longDescription: project.longDescription || '',
      tech: project.tech || [],
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      imageUrl: project.imageUrl || '',
      imageFile: project.imageFile || null,
      videoFile: project.videoFile || null,
      mediaType: project.mediaType || (project.imageUrl ? 'url' : project.imageFile ? 'image' : project.videoFile ? 'video' : 'none'),
      featured: project.featured || false,
      published: project.published || false,
      category: project.category || 'Web Development'
    })
    setEditingProject(project)
    setActiveTab('add')
    setError(null)
    setSuccess(false)
  }

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(projectId)
        await loadProjects()
        alert('Project deleted successfully!')
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Failed to delete project.')
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError(null)
  }

  // File conversion functions
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0]
    if (!file) return

    // Only check size limit for images, no limit for videos
    if (fileType === 'image') {
      const maxSize = 5 * 1024 * 1024 // 5MB for images
      if (file.size > maxSize) {
        setError('Image file size too large. Maximum 5MB allowed.')
        return
      }
    }

    const allowedTypes = fileType === 'image' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      : ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']

    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
      return
    }

    try {
      setUploading(true)
      const base64 = await convertFileToBase64(file)
      
      setFormData(prev => ({
        ...prev,
        [fileType + 'File']: base64,
        mediaType: fileType,
        imageUrl: '' // Clear URL when using file upload
      }))
      setError(null)
    } catch (error) {
      setError('Failed to process file')
    } finally {
      setUploading(false)
    }
  }

  const handleMediaTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      mediaType: type,
      imageUrl: type === 'url' ? prev.imageUrl : '',
      imageFile: type === 'image' ? prev.imageFile : null,
      videoFile: type === 'video' ? prev.videoFile : null
    }))
  }

  const handleTechChange = (tech) => {
    setFormData(prev => ({
      ...prev,
      tech: prev.tech.includes(tech) 
        ? prev.tech.filter(t => t !== tech)
        : [...prev.tech, tech]
    }))
  }

  const addCustomTech = (customTech) => {
    const tech = customTech.trim()
    if (tech && !formData.tech.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        tech: [...prev.tech, tech]
      }))
    }
  }

  const removeTech = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      tech: prev.tech.filter(tech => tech !== techToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Project title is required')
      }
      if (!formData.description.trim()) {
        throw new Error('Project description is required')
      }
      if (formData.tech.length === 0) {
        throw new Error('Please select at least one technology')
      }

      // Validate URLs if provided
      const urlPattern = /^https?:\/\/.+/
      if (formData.liveUrl && !urlPattern.test(formData.liveUrl)) {
        throw new Error('Live URL must be a valid HTTP/HTTPS URL')
      }
      if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
        throw new Error('GitHub URL must be a valid HTTP/HTTPS URL')
      }
      if (formData.imageUrl && !urlPattern.test(formData.imageUrl)) {
        throw new Error('Image URL must be a valid HTTP/HTTPS URL')
      }

      // Create project object
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        longDescription: formData.longDescription.trim(),
        tech: formData.tech,
        liveUrl: formData.liveUrl.trim(),
        githubUrl: formData.githubUrl.trim(),
        imageUrl: formData.mediaType === 'url' ? formData.imageUrl.trim() : '',
        imageFile: formData.mediaType === 'image' ? formData.imageFile : null,
        videoFile: formData.mediaType === 'video' ? formData.videoFile : null,
        mediaType: formData.mediaType,
        featured: formData.featured,
        published: formData.published,
        category: formData.category
      }

      if (editingProject) {
        await updateProject(editingProject.id, projectData)
        setSuccess('Project updated successfully!')
      } else {
        await addProject(projectData)
        setSuccess('Project added successfully!')
      }
      
      setTimeout(() => {
        resetForm()
        if (activeTab === 'manage') {
          loadProjects()
        }
      }, 2000)

    } catch (error) {
      console.error('Error saving project:', error)
      setError(error.message || 'Failed to save project. Please try again.')
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

  const techTagStyle = {
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
    justifyContent: 'center',
    textAlign: 'center'
  }

  const selectedTechStyle = {
    ...techTagStyle,
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
            Project Management
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.25rem' }}>
            Showcase your work and manage your project portfolio
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
            {editingProject ? 'Edit Project' : 'Add New Project'}
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
            Manage Projects
          </button>
        </div>

        {/* Add/Edit Project Form */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} style={glassCardStyle}>
            {editingProject && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#60a5fa', margin: 0, fontWeight: 600 }}>
                  Editing: {editingProject.title}
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

            {/* Success Message */}
            {success && (
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                marginBottom: '2rem',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                marginBottom: '2rem',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Basic Information
              </h3>
              
              <label style={labelStyle}>Project Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter your project title"
                required
                disabled={isSubmitting}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />

              <label style={labelStyle}>Short Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={textareaStyle}
                placeholder="Brief description of your project (2-3 sentences)"
                required
                disabled={isSubmitting}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />

              <label style={labelStyle}>Detailed Description</label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                style={{...textareaStyle, minHeight: '200px'}}
                placeholder="Detailed description of your project..."
                disabled={isSubmitting}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={inputStyle}
                required
                disabled={isSubmitting}
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

            {/* Technologies */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Technologies Used *
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Select all technologies used in this project (at least one required)
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {techOptions.map(tech => (
                  <div
                    key={tech}
                    onClick={() => !isSubmitting && handleTechChange(tech)}
                    style={{
                      ...(formData.tech.includes(tech) ? selectedTechStyle : techTagStyle),
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && !formData.tech.includes(tech)) {
                        e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                        e.target.style.borderColor = '#ef4444'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting && !formData.tech.includes(tech)) {
                        e.target.style.background = 'rgba(255,255,255,0.05)'
                        e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    {tech}
                  </div>
                ))}
              </div>

              {formData.tech.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#6366f1', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    Selected technologies:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.tech.map(tech => (
                      <span
                        key={tech}
                        style={{
                          ...selectedTechStyle,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: isSubmitting ? 0.6 : 1
                        }}
                        onClick={() => !isSubmitting && removeTech(tech)}
                      >
                        {tech} ✕
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Technology */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Add custom technology..."
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                    flex: 1
                  }}
                  disabled={isSubmitting}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isSubmitting) {
                      e.preventDefault()
                      addCustomTech(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    const input = e.target.previousElementSibling
                    addCustomTech(input.value)
                    input.value = ''
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    minWidth: '100px',
                    fontWeight: 600,
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  Add Tech
                </button>
              </div>
            </div>

            {/* Media Upload Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Project Media
              </h3>
              
              {/* Media Type Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Choose Media Type</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '0.75rem' 
                }}>
                  {[
                    { value: 'none', label: 'No Media' },
                    { value: 'url', label: 'Image URL' },
                    { value: 'image', label: 'Upload Image' },
                    { value: 'video', label: 'Upload Video' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMediaTypeChange(option.value)}
                      disabled={isSubmitting}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: formData.mediaType === option.value 
                          ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                          : 'rgba(255,255,255,0.05)',
                        color: formData.mediaType === option.value ? 'white' : '#e2e8f0',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        opacity: isSubmitting ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL Input */}
              {formData.mediaType === 'url' && (
                <div>
                  <label style={labelStyle}>Project Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder="https://example.com/project-screenshot.jpg"
                    disabled={isSubmitting}
                    onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  />
                </div>
              )}

              {/* Image File Upload */}
              {formData.mediaType === 'image' && (
                <div>
                  <label style={labelStyle}>Upload Project Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={isSubmitting || uploading}
                    style={{
                      ...inputStyle,
                      cursor: isSubmitting || uploading ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || uploading ? 0.6 : 1
                    }}
                  />
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                  {uploading && (
                    <div style={{
                      color: '#6366f1',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      padding: '0.5rem'
                    }}>
                      Processing image...
                    </div>
                  )}
                </div>
              )}

              {/* Video File Upload */}
              {formData.mediaType === 'video' && (
                <div>
                  <label style={labelStyle}>Upload Project Video</label>
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={isSubmitting || uploading}
                    style={{
                      ...inputStyle,
                      cursor: isSubmitting || uploading ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || uploading ? 0.6 : 1
                    }}
                  />
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Supported formats: MP4, AVI, MOV, WMV, WebM. No size limit.
                  </p>
                  {uploading && (
                    <div style={{
                      color: '#6366f1',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      padding: '0.5rem'
                    }}>
                      Processing video...
                    </div>
                  )}
                </div>
              )}

              {/* Media Preview */}
              {(formData.imageUrl || formData.imageFile || formData.videoFile) && (
                <div style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  marginTop: '1rem'
                }}>
                  <p style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Media Preview:
                  </p>
                  
                  {/* Image Preview */}
                  {(formData.imageUrl || formData.imageFile) && (
                    <img
                      src={formData.imageFile || formData.imageUrl}
                      alt="Project preview"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'block'
                      }}
                    />
                  )}
                  
                  {/* Video Preview */}
                  {formData.videoFile && (
                    <video
                      controls
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <source src={formData.videoFile} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  <div style={{
                    display: 'none',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#ef4444',
                    fontSize: '0.875rem'
                  }}>
                    Failed to load media
                  </div>
                  
                  {/* Clear Media Button */}
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange('none')}
                    disabled={isSubmitting}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#fca5a5',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    Remove Media
                  </button>
                </div>
              )}
            </div>

            {/* Project Links */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Project Links
              </h3>
              
              <label style={labelStyle}>Live Demo URL</label>
              <input
                type="url"
                name="liveUrl"
                value={formData.liveUrl}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://your-project-demo.com"
                disabled={isSubmitting}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />

              <label style={labelStyle}>GitHub Repository</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://github.com/username/project"
                disabled={isSubmitting}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Project Media
              </h3>
              
              {/* Media Type Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Choose Media Type</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '0.75rem' 
                }}>
                  {[
                    { value: 'none', label: 'No Media' },
                    { value: 'url', label: 'Image URL' },
                    { value: 'image', label: 'Upload Image' },
                    { value: 'video', label: 'Upload Video' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMediaTypeChange(option.value)}
                      disabled={isSubmitting}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: formData.mediaType === option.value 
                          ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                          : 'rgba(255,255,255,0.05)',
                        color: formData.mediaType === option.value ? 'white' : '#e2e8f0',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        opacity: isSubmitting ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL Input */}
              {formData.mediaType === 'url' && (
                <div>
                  <label style={labelStyle}>Project Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder="https://example.com/project-screenshot.jpg"
                    disabled={isSubmitting}
                    onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  />
                </div>
              )}

              {/* Image File Upload */}
              {formData.mediaType === 'image' && (
                <div>
                  <label style={labelStyle}>Upload Project Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={isSubmitting || uploading}
                    style={{
                      ...inputStyle,
                      cursor: isSubmitting || uploading ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || uploading ? 0.6 : 1
                    }}
                  />
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                  {uploading && (
                    <div style={{
                      color: '#6366f1',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      padding: '0.5rem'
                    }}>
                      Processing image...
                    </div>
                  )}
                </div>
              )}

              {/* Video File Upload */}
              {formData.mediaType === 'video' && (
                <div>
                  <label style={labelStyle}>Upload Project Video</label>
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={isSubmitting || uploading}
                    style={{
                      ...inputStyle,
                      cursor: isSubmitting || uploading ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || uploading ? 0.6 : 1
                    }}
                  />
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Supported formats: MP4, AVI, MOV, WMV, WebM. Max size: 50MB
                  </p>
                  {uploading && (
                    <div style={{
                      color: '#6366f1',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      padding: '0.5rem'
                    }}>
                      Processing video...
                    </div>
                  )}
                </div>
              )}

              {/* Media Preview */}
              {(formData.imageUrl || formData.imageFile || formData.videoFile) && (
                <div style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  marginTop: '1rem'
                }}>
                  <p style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Media Preview:
                  </p>
                  
                  {/* Image Preview */}
                  {(formData.imageUrl || formData.imageFile) && (
                    <img
                      src={formData.imageFile || formData.imageUrl}
                      alt="Project preview"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'block'
                      }}
                    />
                  )}
                  
                  {/* Video Preview */}
                  {formData.videoFile && (
                    <video
                      controls
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <source src={formData.videoFile} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  <div style={{
                    display: 'none',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#ef4444',
                    fontSize: '0.875rem'
                  }}>
                    Failed to load media
                  </div>
                  
                  {/* Clear Media Button */}
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange('none')}
                    disabled={isSubmitting}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#fca5a5',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    Remove Media
                  </button>
                </div>
              )}
            </div>

            {/* Settings */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Project Settings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{
                  ...labelStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      accentColor: '#ef4444'
                    }}
                  />
                  Mark as Featured Project
                </label>

                <label style={{
                  ...labelStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}>
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      accentColor: '#ef4444'
                    }}
                  />
                  Publish immediately
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
                  if (editingProject) {
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
                  opacity: isSubmitting ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = 'rgba(255,255,255,0.05)'
                    e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                {editingProject ? 'Cancel Edit' : 'Cancel'}
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.description || formData.tech.length === 0}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: isSubmitting || !formData.title || !formData.description || formData.tech.length === 0
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: isSubmitting || !formData.title || !formData.description || formData.tech.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && formData.title && formData.description && formData.tech.length > 0) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 15px 35px rgba(239, 68, 68, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.3)'
                  }
                }}
              >
                {isSubmitting 
                  ? (editingProject ? 'Updating...' : 'Adding...') 
                  : (editingProject ? 'Update Project' : 'Add Project')
                }
              </button>
            </div>
          </form>
        )}

        {/* Manage Projects Tab */}
        {activeTab === 'manage' && (
          <div style={glassCardStyle}>
            {/* Search and Filter Controls */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Filter Projects
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                />

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                >
                  <option value="all" style={{ background: '#1f2937', color: '#f8fafc' }}>All Status</option>
                  <option value="published" style={{ background: '#1f2937', color: '#f8fafc' }}>Published</option>
                  <option value="draft" style={{ background: '#1f2937', color: '#f8fafc' }}>Draft</option>
                  <option value="featured" style={{ background: '#1f2937', color: '#f8fafc' }}>Featured</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                >
                  <option value="all" style={{ background: '#1f2937', color: '#f8fafc' }}>All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category} style={{ background: '#1f2937', color: '#f8fafc' }}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results count */}
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#94a3b8',
                fontSize: '0.9rem'
              }}>
                <span>
                  Showing {filteredProjects.length} of {existingProjects.length} projects
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setCategoryFilter('all')
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loadingProjects && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#94a3b8'
              }}>
                Loading projects...
              </div>
            )}

            {/* Projects Grid */}
            {!loadingProjects && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}>
                {filteredProjects.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#94a3b8',
                    fontSize: '1.1rem'
                  }}>
                    {existingProjects.length === 0 
                      ? 'No projects found. Create your first project!'
                      : 'No projects match your filters.'
                    }
                  </div>
                ) : (
                  filteredProjects.map(project => (
                    <div
                      key={project.id}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.08)'
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                        e.target.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.05)'
                        e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                        e.target.style.transform = 'translateY(0)'
                      }}
                    >
                      {/* Project Media */}
                      {(project.imageUrl || project.imageFile || project.videoFile) && (
                        <div style={{ marginBottom: '1rem' }}>
                          {/* Image Display */}
                          {(project.imageUrl || (project.mediaType === 'image' && project.imageFile)) && (
                            <img
                              src={project.imageFile || project.imageUrl}
                              alt={project.title}
                              style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          )}
                          
                          {/* Video Display */}
                          {project.mediaType === 'video' && project.videoFile && (
                            <video
                              controls
                              style={{
                                width: '100%',
                                height: '150px',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: '#000'
                              }}
                            >
                              <source src={project.videoFile} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      )}

                      {/* Status Badges */}
                      <div style={{ 
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        {project.featured && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            Featured
                          </span>
                        )}
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          background: project.published 
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'linear-gradient(135deg, #6b7280, #4b5563)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {project.published ? 'Published' : 'Draft'}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          background: 'rgba(99, 102, 241, 0.2)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          color: '#a5b4fc',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {project.category}
                        </span>
                      </div>

                      {/* Project Info */}
                      <h4 style={{
                        color: '#f8fafc',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        lineHeight: '1.3'
                      }}>
                        {project.title}
                      </h4>

                      <p style={{
                        color: '#cbd5e1',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        lineHeight: '1.5',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {project.description}
                      </p>

                      {/* Technologies */}
                      {project.tech && project.tech.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.25rem'
                          }}>
                            {project.tech.slice(0, 3).map(tech => (
                              <span
                                key={tech}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.375rem',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#fca5a5',
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }}
                              >
                                {tech}
                              </span>
                            ))}
                            {project.tech.length > 3 && (
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                color: '#94a3b8',
                                fontSize: '0.75rem'
                              }}>
                                +{project.tech.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Links */}
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.5rem',
                              background: 'rgba(34, 197, 94, 0.1)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              color: '#86efac',
                              fontSize: '0.75rem',
                              textDecoration: 'none',
                              fontWeight: 500
                            }}
                          >
                            Live Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.5rem',
                              background: 'rgba(148, 163, 184, 0.1)',
                              border: '1px solid rgba(148, 163, 184, 0.3)',
                              color: '#cbd5e1',
                              fontSize: '0.75rem',
                              textDecoration: 'none',
                              fontWeight: 500
                            }}
                          >
                            GitHub
                          </a>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '1rem'
                      }}>
                        Created: {formatDate(project.createdAt)}
                        {project.updatedAt && project.updatedAt !== project.createdAt && (
                          <> • Updated: {formatDate(project.updatedAt)}</>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        justifyContent: 'flex-end'
                      }}>
                        <button
                          onClick={() => loadProjectForEditing(project)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(59, 130, 246, 0.2)'
                            e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(59, 130, 246, 0.1)'
                            e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#fca5a5',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.2)'
                            e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                            e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}