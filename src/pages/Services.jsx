import { useState, useEffect, useRef } from 'react'
import { 
  Code, 
  Smartphone, 
  Globe, 
  Database, 
  Shield, 
  Zap, 
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  User,
  Calendar,
  DollarSign,
  MessageCircle,
  Lock,
  LogIn
} from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import { getUserByEmail, addServiceBooking } from '../services/firebaseService'
import GoogleAuthModal from "../components/Auth/GoogleAuthModal.jsx";


export default function Services() {
  const [showElements, setShowElements] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectDetails: '',
    timeline: '',
    budget: '',
    urgency: 'normal'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const particlesRef = useRef(null)

  useEffect(() => {
    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      
      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userDoc = await getUserByEmail(firebaseUser.email)
          
          if (userDoc) {
            setUser(userDoc)
            setBookingData(prev => ({
              ...prev,
              name: userDoc.name || '',
              email: userDoc.email || ''
            }))
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
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!loading && user) {
      // Add styles and animations only after user is authenticated
      const link = document.createElement('link')
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      document.body.style.fontFamily = 'Inter, sans-serif'
      document.body.style.background = '#0a0a0a'
      document.body.style.color = '#f0f0f0'
      document.body.style.margin = '0'
      document.body.style.padding = '0'

      setTimeout(() => setShowElements(true), 300)

      // Create particles
      const createParticles = () => {
        if (!particlesRef.current) return
        
        for (let i = 0; i < 25; i++) {
          const particle = document.createElement('div')
          particle.style.cssText = `
            position: absolute;
            background: rgba(${Math.random() > 0.5 ? '99, 102, 241' : '168, 85, 247'}, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            pointer-events: none;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particle-drift ${Math.random() * 20 + 15}s linear infinite;
            animation-delay: ${Math.random() * 10}s;
          `
          particlesRef.current.appendChild(particle)
        }
      }

      const style = document.createElement('style')
      style.textContent = `
        @keyframes particle-drift {
          0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100px) translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-15px); }
          70% { transform: translateY(-7px); }
        }
      `
      document.head.appendChild(style)

      createParticles()

      return () => {
        if (document.head.contains(link)) document.head.removeChild(link)
        if (document.head.contains(style)) document.head.removeChild(style)
      }
    }
  }, [loading, user])

  // Single service for web development and project help
  const service = {
    id: 1,
    title: 'Web Development & Project Assistance',
    icon: Globe,
    description: 'Complete web development solutions and project assistance using modern technologies and best practices',
    features: [
      'Full-Stack Web Development', 
      'React/Next.js Applications', 
      'Backend API Development', 
      'Database Design & Integration',
      'Project Consultation', 
      'Code Review & Optimization',
      'Deployment & Hosting', 
      'Ongoing Support'
    ],
    price: 'From ₹10,000',
    duration: '1-8 weeks',
    rating: 4.9,
    color: '#3b82f6'
  }

  const handleAuthSuccess = async (userData) => {
    setUser(userData)
    setShowAuthModal(false)
    setBookingData(prev => ({
      ...prev,
      name: userData.name || '',
      email: userData.email || ''
    }))
  }

  const handleBookService = () => {
    setSelectedService(service)
    setShowBookingForm(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitBooking = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Save booking to Firebase using the updated firebaseService
      await addServiceBooking({
        ...bookingData,
        serviceType: service.title,
        userId: user.uid, // Use Firebase UID
        userName: user.name,
        userEmail: user.email,
        description: bookingData.projectDetails,
        message: bookingData.projectDetails
      })

      setSubmitMessage('Service booked successfully! We\'ll contact you within 24 hours.')
      setTimeout(() => {
        setShowBookingForm(false)
        setSelectedService(null)
        setBookingData({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          company: '',
          projectDetails: '',
          timeline: '',
          budget: '',
          urgency: 'normal'
        })
        setSubmitMessage('')
      }, 3000)

    } catch (error) {
      console.error('Error booking service:', error)
      setSubmitMessage('Error booking service. Please try again.')
    }

    setIsSubmitting(false)
  }

  const containerStyle = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0e4b99 100%)',
    minHeight: '100vh',
    padding: '8rem 1.5rem 4rem',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '-7rem'
  }

  const glassCardStyle = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '2rem',
    boxShadow: '0 25px 45px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.4s ease',
    position: 'relative',
    overflow: 'hidden'
  }

  // Loading state
  if (loading) {
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
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: '#cbd5e1',
            fontSize: '1.125rem',
            fontWeight: 500
          }}>
            Loading services...
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
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
                color: '#f8fafc',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Authentication Required
              </h2>
              
              <p style={{
                fontSize: '1.125rem',
                color: '#cbd5e1',
                marginBottom: '2.5rem',
                lineHeight: 1.6
              }}>
                Please sign in to access our web development services and book your project assistance.
              </p>
              
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
                  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)'
                  e.target.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)'
                  e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'
                }}
              >
                <LogIn size={20} />
                Sign In to Continue
              </button>
              
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '1rem',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#3b82f6',
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
                  <li>Track your project bookings and status</li>
                  <li>Access your service history</li>
                  <li>Get personalized project recommendations</li>
                  <li>Direct communication with our development team</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        <GoogleAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Particles */}
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
      
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        width: '10rem',
        height: '10rem',
        background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        width: '8rem',
        height: '8rem',
        background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '-4s'
      }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Welcome Message */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out'
        }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '9999px',
            padding: '0.75rem 1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <User size={16} style={{ color: '#3b82f6' }} />
            <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem' }}>
              Welcome back, {user.name}!
            </span>
          </div>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out 0.2s'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
            fontWeight: 900,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: 'pulse-glow 3s ease-in-out infinite alternate'
          }}>
            Web Development Services
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#cbd5e1',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}>
            Professional web development and project assistance tailored to bring your ideas to life
          </p>
          <div style={{
            width: '6rem',
            height: '0.25rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            margin: '0 auto',
            borderRadius: '9999px'
          }}></div>
        </div>

        {/* Single Service Card */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '4rem'
        }}>
          <div
            style={{
              ...glassCardStyle,
              padding: '3rem',
              maxWidth: '800px',
              width: '100%',
              opacity: showElements ? 1 : 0,
              transform: showElements ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease-out 0.4s',
              animation: 'float 10s ease-in-out infinite',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'
              e.currentTarget.style.boxShadow = `0 35px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 30px ${service.color}30`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 25px 45px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Service Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '1.5rem',
                background: `linear-gradient(135deg, ${service.color}20, ${service.color}10)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${service.color}30`
              }}>
                <service.icon size={40} style={{ color: service.color }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  margin: 0,
                  color: '#f8fafc'
                }}>
                  {service.title}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(service.rating) ? service.color : 'none'}
                        style={{ color: service.color }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>
                    {service.rating} • Trusted by 50+ clients
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: '2rem',
              fontSize: '1.125rem',
              textAlign: 'center'
            }}>
              {service.description}
            </p>

            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem'
            }}>
              {service.features.map((feature, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '1rem',
                  color: '#e2e8f0',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <CheckCircle size={16} style={{ color: service.color, flexShrink: 0 }} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Price and Duration */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2.5rem',
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '1.5rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <DollarSign size={24} style={{ color: service.color }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.25rem' }}>
                    {service.price}
                  </span>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
                    Flexible pricing based on project scope
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={24} style={{ color: '#94a3b8' }} />
                <div>
                  <span style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 600 }}>
                    {service.duration}
                  </span>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
                    Delivery timeline
                  </p>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <button 
              onClick={handleBookService}
              style={{
                width: '100%',
                background: `linear-gradient(135deg, ${service.color}, ${service.color}dd)`,
                color: 'white',
                border: 'none',
                padding: '1.5rem 2rem',
                borderRadius: '1rem',
                fontWeight: 700,
                fontSize: '1.125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = `0 15px 35px ${service.color}40`
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Book Your Project Now
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div style={{
          ...glassCardStyle,
          padding: '3rem',
          textAlign: 'center',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out 0.6s'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#3b82f6'
          }}>
            Why Choose Our Service?
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#cbd5e1',
            marginBottom: '2.5rem',
            maxWidth: '800px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Get professional web development services with personalized attention, modern technologies, 
            and ongoing support to ensure your project's success.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {[
              { icon: Code, title: 'Modern Tech Stack', desc: 'Latest frameworks and best practices' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Quick turnaround without compromising quality' },
              { icon: Shield, title: 'Reliable Support', desc: '24/7 assistance and maintenance' },
              { icon: Star, title: 'Quality Guaranteed', desc: '100% satisfaction or money back' }
            ].map((item, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <item.icon size={32} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                <h4 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                  {item.title}
                </h4>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1rem 2.5rem',
              borderRadius: '9999px',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)'
              e.target.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)'
            }}
          >
            <MessageCircle size={20} />
            Discuss Your Project
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && selectedService && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            ...glassCardStyle,
            padding: '2.5rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'slide-up 0.4s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#f8fafc',
                margin: 0,
                flex: 1
              }}>
                Book {selectedService.title}
              </h3>
              <button
                onClick={() => {
                  setShowBookingForm(false)
                  setSelectedService(null)
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

            {submitMessage && (
              <div style={{
                padding: '1rem',
                marginBottom: '2rem',
                borderRadius: '0.75rem',
                backgroundColor: submitMessage.includes('Error') ? 
                  'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                border: submitMessage.includes('Error') ? 
                  '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                color: submitMessage.includes('Error') ? '#fca5a5' : '#86efac',
                textAlign: 'center',
                fontWeight: 500
              }}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={bookingData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = selectedService.color
                      e.target.style.boxShadow = `0 0 0 3px ${selectedService.color}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = selectedService.color
                      e.target.style.boxShadow = `0 0 0 3px ${selectedService.color}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = selectedService.color
                      e.target.style.boxShadow = `0 0 0 3px ${selectedService.color}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={bookingData.company}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = selectedService.color
                      e.target.style.boxShadow = `0 0 0 3px ${selectedService.color}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  Project Details *
                </label>
                <textarea
                  name="projectDetails"
                  value={bookingData.projectDetails}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Describe your project requirements, goals, and any specific features you need..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#f8fafc',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = selectedService.color
                    e.target.style.boxShadow = `0 0 0 3px ${selectedService.color}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    Timeline *
                  </label>
                  <select
                    name="timeline"
                    value={bookingData.timeline}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = selectedService.color
                      e.target.style.boxShadow = `0 0 0 3px ${selectedService.color}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="">Select timeline</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="3-4 weeks">3-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="3+ months">3+ months</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    Budget Range *
                  </label>
                  <select
                    name="budget"
                    value={bookingData.budget}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = selectedService.color
                      e.target.style.boxShadow = `0 0 0 3px ${selectedService.color}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="">Select budget</option>
                    <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                    <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="₹1,00,000+">₹1,00,000+</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  Project Urgency
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['low', 'normal', 'high'].map((level) => (
                    <label key={level} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}>
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={bookingData.urgency === level}
                        onChange={handleInputChange}
                        style={{
                          accentColor: selectedService.color,
                          transform: 'scale(1.2)'
                        }}
                      />
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false)
                    setSelectedService(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '2px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.05)'
                    e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: isSubmitting ? 
                      'rgba(156, 163, 175, 0.5)' : 
                      `linear-gradient(135deg, ${selectedService.color}, ${selectedService.color}dd)`,
                    color: 'white',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = `0 8px 20px ${selectedService.color}40`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar size={20} />
                      Book Service
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
