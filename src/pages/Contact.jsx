import { useState, useEffect, useRef } from 'react'
import { addContactMessage } from '../services/firebaseService'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'

export default function Contact() {
  const [showElements, setShowElements] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgency: 'normal'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [activeContactMethod, setActiveContactMethod] = useState(null)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const particlesRef = useRef(null)

  useEffect(() => {
    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthenticated(!!currentUser)
    })

    // Add Google Fonts and global styles
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Set body styles
    document.body.style.fontFamily = 'Inter, sans-serif'
    document.body.style.background = '#0a0a0a'
    document.body.style.color = '#f0f0f0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.scrollBehavior = 'smooth'

    // Create floating particles
    const createParticles = () => {
      if (!particlesRef.current) return
      
      const particleCount = 40
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.style.position = 'absolute'
        particle.style.background = `rgba(${Math.random() > 0.5 ? '34, 197, 94' : '59, 130, 246'}, ${Math.random() * 0.4 + 0.1})`
        particle.style.borderRadius = '50%'
        particle.style.pointerEvents = 'none'
        
        const size = Math.random() * 6 + 2
        particle.style.width = size + 'px'
        particle.style.height = size + 'px'
        
        particle.style.left = Math.random() * 100 + '%'
        particle.style.top = Math.random() * 100 + '%'
        particle.style.animation = `particle-drift ${Math.random() * 25 + 20}s linear infinite`
        particle.style.animationDelay = Math.random() * 15 + 's'
        
        particlesRef.current.appendChild(particle)
      }
    }

    // Add keyframes
    const style = document.createElement('style')
    style.textContent = `
      @keyframes particle-drift {
        0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateX(150px) translateY(-150px) rotate(360deg); opacity: 0; }
      }
      @keyframes float-gentle {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(3deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { 
          text-shadow: 0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.3);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
        }
        50% { 
          text-shadow: 0 0 30px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.4);
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
        }
      }
      @keyframes morph-contact {
        0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        50% { border-radius: 50% 50% 20% 80% / 25% 60% 40% 75%; }
        75% { border-radius: 40% 70% 60% 30% / 70% 50% 60% 30%; }
      }
      @keyframes slide-in-up {
        from { transform: translateY(40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes bounce-in {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes success-pulse {
        0%, 100% { transform: scale(1); background: linear-gradient(135deg, #22c55e, #16a34a); }
        50% { transform: scale(1.05); background: linear-gradient(135deg, #16a34a, #15803d); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .contact-method-hover:hover {
        transform: translateY(-8px) scale(1.05) !important;
        box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3) !important;
      }
    `
    document.head.appendChild(style)

    createParticles()
    setTimeout(() => setShowElements(true), 300)

    // Auto-fill email if user is logged in
    if (isAuthenticated && user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        name: user.displayName || user.name || ''
      }))
    }

    return () => {
      unsubscribe() // Cleanup auth listener
      if (document.head.contains(link)) document.head.removeChild(link)
      if (document.head.contains(style)) document.head.removeChild(style)
    }
  }, [isAuthenticated, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear any error states when user starts typing
    if (submitStatus?.type === 'error') {
      setSubmitStatus(null)
    }
  }

  const sendEmail = async (emailData) => {
    try {
      const response = await fetch('../api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send email')
      }

      return await response.json()
    } catch (error) {
      console.error('Email API error:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields'
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid email address'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Prepare email data
      const emailData = {
        from_name: formData.name,
        from_email: formData.email,
        to_email: 'emmanuelnavaraj@gmail.com',
        subject: formData.subject || 'New Contact Form Message from Portfolio',
        message: formData.message,
        urgency: formData.urgency,
        user_id: user?.uid || 'Anonymous',
        timestamp: new Date().toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        reply_to: formData.email
      }

      // Send email via API
      const emailResult = await sendEmail(emailData)
      console.log('Email sent successfully:', emailResult)

      // Save to Firebase (as backup and for admin dashboard)
      await addContactMessage({
        ...formData,
        userId: user?.uid || null,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        emailSent: true,
        messageId: emailResult.messageId
      })

      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! Email delivered to Emmanuel. You should receive a confirmation shortly.'
      })

      // Reset form if not authenticated (keep user data if logged in)
      if (!isAuthenticated) {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          urgency: 'normal'
        })
      } else {
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: '',
          urgency: 'normal'
        }))
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Try to save to Firebase even if email fails
      try {
        await addContactMessage({
          ...formData,
          userId: user?.uid || null,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          emailSent: false,
          emailError: error.message
        })
        
        setSubmitStatus({
          type: 'error',
          message: 'Email service temporarily unavailable, but your message has been saved. Try WhatsApp for immediate response.'
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        setSubmitStatus({
          type: 'error',
          message: 'Failed to send message. Please try WhatsApp or email directly: emmanuelnavaraj@gmail.com'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEmailClient = () => {
    const subject = encodeURIComponent(formData.subject || 'Contact from Portfolio')
    const body = encodeURIComponent(`Hi Emmanuel,\n\n${formData.message}\n\nBest regards,\n${formData.name}`)
    window.open(`mailto:emmanuelnavaraj@gmail.com?subject=${subject}&body=${body}`, '_self')
  }

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hi Emmanuel! I'm ${formData.name || 'someone'} reaching out from your portfolio. ${formData.message || 'Would love to connect!'}`)
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank') // Replace with your actual WhatsApp number
  }

  const containerStyle = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a2e1a 25%, #2d4a2d 50%, #1a2e1a 75%, #0a0a0a 100%)',
    minHeight: '100vh',
    padding: '6rem 1.5rem',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '-7rem'
  }

  const glassCardStyle = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '1.5rem',
    boxShadow: `
      0 25px 45px rgba(0,0,0,0.3),
      inset 0 1px 0 rgba(255,255,255,0.1)
    `,
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s ease'
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
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  }

  const contactMethods = [
    {
      name: 'Email',
      icon: '📧',
      color: '#3b82f6',
      description: 'Send me an email directly',
      action: openEmailClient,
      handle: 'emmanuelnavaraj@gmail.com'
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: '#22c55e',
      description: 'Quick chat on WhatsApp',
      action: openWhatsApp,
      handle: '+91 98765 43210' // Replace with your actual number
    },
    {
      name: 'Discord',
      icon: '🎮',
      color: '#5865f2',
      description: 'Join me on Discord',
      action: () => window.open('https://discord.gg/yourusername', '_blank'), // Replace with your Discord
      handle: '@emmanueln'
    },
    {
      name: 'Instagram',
      icon: '📸',
      color: '#e4405f',
      description: 'Connect on Instagram',
      action: () => window.open('https://instagram.com/yourusername', '_blank'), // Replace with your Instagram
      handle: '@emmanuel_dev'
    }
  ]

  return (
    <div style={containerStyle}>
      {/* Particles */}
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
      
      {/* Floating geometric shapes */}
      <div style={{
        position: 'absolute',
        top: '8rem',
        right: '8rem',
        width: '10rem',
        height: '10rem',
        background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))',
        animation: 'morph-contact 15s ease-in-out infinite',
        opacity: 0.4
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '5%',
        width: '14rem',
        height: '14rem',
        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
        animation: 'morph-contact 18s ease-in-out infinite',
        animationDelay: '-9s',
        opacity: 0.3
      }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '4rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: 900,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #22c55e, #3b82f6, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: 'pulse-glow 3s ease-in-out infinite alternate'
          }}>
            Let's Connect! 🚀
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#d1d5db',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Have a project in mind or just want to say hi? I'd love to hear from you!
          </p>
          <div style={{
            width: '6rem',
            height: '0.25rem',
            background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
            margin: '2rem auto 0',
            borderRadius: '9999px'
          }}></div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* Contact Form */}
          <div style={{
            ...glassCardStyle,
            padding: '3rem',
            opacity: showElements ? 1 : 0,
            transform: showElements ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease-out 0.2s',
            animation: 'float-gentle 10s ease-in-out infinite'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '2rem',
                animation: 'bounce-in 1s ease-out 0.5s both'
              }}>
                ✉️
              </div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#22c55e'
              }}>
                Send Message
              </h2>
            </div>

            {/* User Authentication Status */}
            {isAuthenticated && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <span style={{ color: '#86efac', fontSize: '0.9rem' }}>
                  Logged in as <strong>{user?.email}</strong>
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#e2e8f0'
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#e2e8f0'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#e2e8f0'
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What's this about?"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#e2e8f0'
                }}>
                  Priority
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                >
                  <option value="normal" style={{ background: '#1f2937' }}>🟢 Normal</option>
                  <option value="high" style={{ background: '#1f2937' }}>🟡 High</option>
                  <option value="urgent" style={{ background: '#1f2937' }}>🔴 Urgent</option>
                </select>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#e2e8f0'
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell me about your project, ideas, or just say hello!"
                  rows={6}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  required
                />
              </div>

              {/* Submit Status */}
              {submitStatus && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  marginBottom: '1.5rem',
                  background: submitStatus.type === 'success' 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: submitStatus.type === 'success'
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)',
                  color: submitStatus.type === 'success' ? '#86efac' : '#fca5a5',
                  animation: submitStatus.type === 'error' ? 'shake 0.5s ease-in-out' : 'success-pulse 2s ease-in-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {submitStatus.type === 'success' ? '✅' : '❌'}
                    </span>
                    {submitStatus.message}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: isSubmitting 
                    ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)',
                  opacity: isSubmitting ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)'
                    e.target.style.boxShadow = '0 15px 35px rgba(34, 197, 94, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(0) scale(1)'
                    e.target.style.boxShadow = '0 10px 25px rgba(34, 197, 94, 0.3)'
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}>
                      ⏳
                    </span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message 🚀
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Alternative Contact Methods */}
          <div style={{
            opacity: showElements ? 1 : 0,
            transform: showElements ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease-out 0.4s'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '2rem',
              color: '#3b82f6',
              textAlign: 'center'
            }}>
              🌟 Other Ways to Connect
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {contactMethods.map((method, index) => (
                <div
                  key={method.name}
                  className="contact-method-hover"
                  style={{
                    ...glassCardStyle,
                    padding: '2rem',
                    cursor: 'pointer',
                    transform: activeContactMethod === method.name ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
                    boxShadow: activeContactMethod === method.name 
                      ? `0 25px 50px rgba(${method.color === '#22c55e' ? '34, 197, 94' : method.color === '#3b82f6' ? '59, 130, 246' : method.color === '#5865f2' ? '88, 101, 242' : '228, 64, 95'}, 0.3)`
                      : '0 15px 35px rgba(0,0,0,0.2)',
                    animation: `float-gentle ${8 + index}s ease-in-out infinite`,
                    animationDelay: `${index * -2}s`
                  }}
                  onClick={method.action}
                  onMouseEnter={() => setActiveContactMethod(method.name)}
                  onMouseLeave={() => setActiveContactMethod(null)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      background: `linear-gradient(135deg, ${method.color}, ${method.color}dd)`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '4rem',
                      height: '4rem',
                      borderRadius: '1rem',
                      border: `2px solid ${method.color}33`,
                      backgroundColor: `${method.color}11`
                    }}>
                      {method.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: method.color,
                        marginBottom: '0.5rem'
                      }}>
                        {method.name}
                      </h3>
                      <p style={{
                        color: '#cbd5e1',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        {method.description}
                      </p>
                      <span style={{
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}>
                        {method.handle}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      color: method.color,
                      opacity: 0.7,
                      transform: activeContactMethod === method.name ? 'translateX(5px)' : 'translateX(0)',
                      transition: 'transform 0.3s ease'
                    }}>
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Response Time */}
            <div style={{
              ...glassCardStyle,
              padding: '2rem',
              textAlign: 'center',
              marginTop: '2rem',
              animation: 'float-gentle 12s ease-in-out infinite',
              animationDelay: '-4s'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#f59e0b',
                marginBottom: '0.5rem'
              }}>
                Quick Response
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                I typically respond within 24 hours. For urgent matters, WhatsApp is the fastest way to reach me!
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{
          textAlign: 'center',
          marginTop: '4rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out 1s'
        }}>
          <p style={{
            fontSize: '1.1rem',
            color: '#94a3b8',
            marginBottom: '1rem'
          }}>
            Looking forward to hearing from you and building something amazing together! ✨
          </p>
        </div>
      </div>
    </div>
  )
}