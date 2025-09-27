import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProject } from '../services/firebaseService'

export default function AddProject() {
  const navigate = useNavigate()
  const [showElements, setShowElements] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    featured: false,
    category: 'Web Development'
  })

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
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError(null) // Clear error when user starts typing
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
        imageUrl: formData.imageUrl.trim(),
        featured: formData.featured,
        category: formData.category
      }

      // Save to Firebase
      const projectId = await addProject(projectData)
      
      setSuccess(true)
      
      // Show success message and redirect after delay
      setTimeout(() => {
        navigate('/admin')
      }, 2000)

    } catch (error) {
      console.error('Error adding project:', error)
      setError(error.message || 'Failed to add project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
    marginBottom: '1rem'
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

  return (
    <div style={containerStyle}>
      <div style={{
        maxWidth: '1000px',
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
            ➕ Add New Project
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.25rem' }}>
            Showcase your amazing work to the world
          </p>
        </div>

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
            🎉 Project added successfully! Redirecting to admin panel...
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
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={glassCardStyle}>
          {/* Basic Info */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              📋 Basic Information
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
              placeholder="Detailed description of your project:

• What problem does it solve?
• Key features and functionalities
• Challenges faced and how you overcame them
• Technical implementation details
• Future improvements planned

This will be displayed on the project detail page."
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
              🛠️ Technologies Used *
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

          {/* URLs */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              🔗 Project Links
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
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              💡 Tip: Upload your images to services like Imgur, Cloudinary, or use GitHub raw URLs
            </p>
          </div>

          {/* Featured */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              ⚙️ Project Settings
            </h3>
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
              ⭐ Mark as Featured Project
            </label>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Featured projects will be highlighted on your portfolio homepage and get more visibility
            </p>
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
              onClick={() => navigate('/admin')}
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
              Cancel
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
              {isSubmitting ? '📤 Adding Project...' : '✨ Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}