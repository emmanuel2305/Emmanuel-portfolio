import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addBlog } from '../services/firebaseService'

export default function AddBlog() {
  const navigate = useNavigate()
  const [showElements, setShowElements] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  }, [])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imageData: e.target.result, // This contains the base64 data
          imageUrl: '' // Clear URL if file is uploaded
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
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // If imageUrl is being set, clear uploaded image
    if (name === 'imageUrl' && value) {
      setFormData(prev => ({
        ...prev,
        imageFile: null,
        imageData: null
      }))
      // Clear the file input
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
      // Create blog object (without local ID since Firebase will generate one)
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
        // Include image data if uploaded, otherwise use URL
        featuredImage: formData.imageData || formData.imageUrl || null,
        imageType: formData.imageFile ? formData.imageFile.type : (formData.imageUrl ? 'url' : null)
      }

      // Add blog to Firebase
      const blogId = await addBlog(blogData)
      
      // Show success message and redirect
      alert('Blog post added successfully!')
      navigate('/admin')
    } catch (error) {
      console.error('Error adding blog:', error)
      alert('Failed to add blog post. Please try again.')
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
            ✍️ Write New Blog Post
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.25rem' }}>
            Share your knowledge and insights with the world
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={glassCardStyle}>
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
              
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                💡 Upload an image file (max 5MB) or provide an image URL. Uploaded images will be stored as binary data.
              </p>
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
              placeholder="Write your blog content here. You can use markdown formatting:

# Main Heading
## Sub Heading
**Bold Text**
*Italic Text*
`code snippet`
```
code block
```
[Link](https://example.com)
![Image](https://example.com/image.jpg)

- List item 1
- List item 2
1. Numbered item 1
2. Numbered item 2

> Quote block

---

Write your thoughts, insights, tutorials, or any content you'd like to share!"
              required
              onFocus={(e) => e.target.style.borderColor = '#ef4444'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              💡 Tip: You can use Markdown formatting for rich text content
            </p>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem' }}>
              🏷️ Tags
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Select relevant tags to help readers find your content
            </p>
            
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
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)'
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
                🌍 Publish immediately
              </label>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Featured posts will be highlighted, unpublished posts will be saved as drafts
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
                opacity: isSubmitting ? 0.7 : 1
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
              onMouseEnter={(e) => {
                if (!isSubmitting && formData.title && formData.excerpt && formData.content) {
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
              {isSubmitting ? '🔄 Publishing...' : formData.published ? '🚀 Publish Blog' : '💾 Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}