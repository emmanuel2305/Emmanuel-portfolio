import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [nameText, setNameText] = useState('')
  const [showElements, setShowElements] = useState(false)
  const particlesRef = useRef(null)
  const magneticBtnRef = useRef(null)

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

    // Fixed typing animation
    const text = "Emmanuel"
    let currentIndex = 0
    const typeWriter = () => {
      if (currentIndex < text.length) {
        setNameText(text.substring(0, currentIndex + 1))
        currentIndex++
        setTimeout(typeWriter, 150)
      }
    }
    
    setTimeout(typeWriter, 1000)
    setTimeout(() => setShowElements(true), 500)

    // Create particles
    const createParticles = () => {
      if (!particlesRef.current) return
      
      const particleCount = 50
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.style.position = 'absolute'
        particle.style.background = 'rgba(255, 255, 255, 0.1)'
        particle.style.borderRadius = '50%'
        particle.style.pointerEvents = 'none'
        
        const size = Math.random() * 6 + 2
        particle.style.width = size + 'px'
        particle.style.height = size + 'px'
        
        particle.style.left = Math.random() * 100 + '%'
        particle.style.animation = `particle-float ${Math.random() * 10 + 15}s linear infinite`
        particle.style.animationDelay = Math.random() * 20 + 's'
        
        particlesRef.current.appendChild(particle)
      }
    }

    // Add keyframes
    const style = document.createElement('style')
    style.textContent = `
      @keyframes particle-float {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
      }
      @keyframes gradient-shift {
        0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
        50% { transform: translateX(100%) translateY(100%) rotate(180deg); }
      }
      @keyframes pulse-glow {
        0% { text-shadow: 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2), 0 0 60px rgba(99, 102, 241, 0.1); }
        100% { text-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.3), 0 0 80px rgba(99, 102, 241, 0.2); }
      }
      @keyframes card-shine {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      @keyframes float-slow { 
        0%,100%{ transform: translateY(0) rotate(0deg); } 
        50% { transform: translateY(-20px) rotate(5deg); } 
      }
      @keyframes float-slower { 
        0%,100%{ transform: translateY(0) rotate(0deg); } 
        50% { transform: translateY(-15px) rotate(-3deg); } 
      }
      @keyframes float-fast { 
        0%,100%{ transform: translateY(0) rotate(0deg); } 
        50% { transform: translateY(-25px) rotate(8deg); } 
      }
      @keyframes blink-caret {
        0%, 50% { border-color: #667eea; }
        51%, 100% { border-color: transparent; }
      }
      @keyframes morph {
        0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
        50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
        75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
      }
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translateX(-50%) translateY(0); }
        40%, 43% { transform: translateX(-50%) translateY(-10px); }
        70% { transform: translateX(-50%) translateY(-5px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `
    document.head.appendChild(style)

    createParticles()

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
      if (document.head.contains(style)) document.head.removeChild(style)
    }
  }, [])

  const handleMagneticBtn = (e) => {
    if (!magneticBtnRef.current) return
    const rect = magneticBtnRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    magneticBtnRef.current.style.transform = `scale(1.05) translate(${x * 0.1}px, ${y * 0.1}px)`
  }

  const handleMagneticBtnLeave = () => {
    if (!magneticBtnRef.current) return
    magneticBtnRef.current.style.transform = 'scale(1) translate(0px, 0px)'
  }

  const heroStyle = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0e4b99 100%)',
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 1.5rem',
    overflow: 'hidden',
    overflowX: 'hidden',
    marginTop: '-6rem'
  }

  const glowTextStyle = {
    textShadow: `
      0 0 20px rgba(99, 102, 241, 0.3),
      0 0 40px rgba(99, 102, 241, 0.2),
      0 0 60px rgba(99, 102, 241, 0.1)
    `,
    animation: 'pulse-glow 3s ease-in-out infinite alternate'
  }

  const glassCardStyle = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '1rem',
    boxShadow: `
      0 15px 35px rgba(0,0,0,0.3),
      inset 0 1px 0 rgba(255,255,255,0.1)
    `,
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden'
  }

  const techTagStyle = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#e2e8f0',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: '600',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }

  const magneticBtnStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem 2.5rem',
    borderRadius: '9999px',
    fontWeight: 'bold',
    fontSize: '1.125rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <section id="home" style={heroStyle}>
        {/* Particles */}
        <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
        
        {/* Animated gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
          animation: 'gradient-shift 8s ease-in-out infinite'
        }}></div>

        {/* Geometric shapes */}
        <div style={{
          position: 'absolute',
          top: '5rem',
          left: '5rem',
          width: '10rem',
          height: '10rem',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
          animation: 'morph 8s ease-in-out infinite',
          opacity: 0.3
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '5rem',
          width: '14rem',
          height: '14rem',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
          animation: 'morph 8s ease-in-out infinite',
          animationDelay: '-4s',
          opacity: 0.2
        }}></div>

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 8rem)',
            fontWeight: 900,
            marginBottom: '1.5rem',
            opacity: showElements ? 1 : 0,
            transform: showElements ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out',
            ...glowTextStyle
          }}>
            Hi, I'm <span style={{
              borderRight: '2px solid #667eea',
              animation: 'blink-caret 1s step-end infinite'
            }}>{nameText}</span>
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.25rem, 3vw, 3rem)',
            color: '#d1d5db',
            marginBottom: '3rem',
            fontWeight: 300,
            letterSpacing: '0.05em',
            opacity: showElements ? 1 : 0,
            transform: showElements ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out 0.2s'
          }}>
            I build <span style={{ color: '#6366f1', fontWeight: 600 }}>clean</span>, 
            <span style={{ color: '#a855f7', fontWeight: 600 }}> modern</span>, and 
            <span style={{ color: '#3b82f6', fontWeight: 600 }}> interactive</span> web experiences
          </p>
          
          <div style={{
            opacity: showElements ? 1 : 0,
            transform: showElements ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out 0.4s'
          }}>
            <button 
              ref={magneticBtnRef}
              style={magneticBtnStyle}
              onMouseMove={handleMagneticBtn}
              onMouseLeave={handleMagneticBtnLeave}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05) translateY(-2px)'
                e.target.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4)'
              }}
            >
              See My Work
            </button>
          </div>
        </div>

        {/* Floating glass cards */}
        <div style={{...glassCardStyle, position: 'absolute', top: '5rem', left: '4rem', width: '10rem', height: '7rem', animation: 'float-slow 6s ease-in-out infinite'}}></div>
        <div style={{...glassCardStyle, position: 'absolute', bottom: '10rem', right: '5rem', width: '12rem', height: '8rem', animation: 'float-slower 8s ease-in-out infinite'}}></div>
        <div style={{...glassCardStyle, position: 'absolute', top: '50%', left: '25%', width: '9rem', height: '6rem', animation: 'float-fast 4s ease-in-out infinite'}}></div>

        {/* Tech tags */}
        <div style={{
          position: 'absolute',
          bottom: '4rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1.5rem',
          zIndex: 20,
          padding: '0 1rem'
        }}>
          {['Laravel', 'Tailwind CSS', 'React', 'Python', 'AI/ML'].map((tech, index) => (
            <span 
              key={tech}
              style={{
                ...techTagStyle,
                opacity: showElements ? 1 : 0,
                transform: showElements ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.8s ease-out ${0.6 + index * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(99, 102, 241, 0.2)'
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)'
                e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite'
        }}>
          <div style={{
            width: '1.5rem',
            height: '2.5rem',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '9999px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '0.25rem',
              height: '0.75rem',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '9999px',
              marginTop: '0.5rem',
              animation: 'pulse 2s infinite'
            }}></div>
          </div>
        </div>
      </section>
    </div>
  )
}
