import { useState, useEffect, useRef } from 'react'

export default function About() {
  const [showElements, setShowElements] = useState(false)
  const [activeSkill, setActiveSkill] = useState(null)
  const aboutRef = useRef(null)
  const particlesRef = useRef(null)

  useEffect(() => {
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

    // Trigger animations
    setTimeout(() => setShowElements(true), 300)

    // Create floating particles
    const createParticles = () => {
      if (!particlesRef.current) return
      
      const particleCount = 30
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.style.position = 'absolute'
        particle.style.background = `rgba(${Math.random() > 0.5 ? '99, 102, 241' : '168, 85, 247'}, ${Math.random() * 0.3 + 0.1})`
        particle.style.borderRadius = '50%'
        particle.style.pointerEvents = 'none'
        
        const size = Math.random() * 4 + 2
        particle.style.width = size + 'px'
        particle.style.height = size + 'px'
        
        particle.style.left = Math.random() * 100 + '%'
        particle.style.top = Math.random() * 100 + '%'
        particle.style.animation = `particle-drift ${Math.random() * 20 + 15}s linear infinite`
        particle.style.animationDelay = Math.random() * 10 + 's'
        
        particlesRef.current.appendChild(particle)
      }
    }

    // Add keyframes
    const style = document.createElement('style')
    style.textContent = `
      @keyframes particle-drift {
        0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(100px) translateY(-100px) rotate(360deg); opacity: 0; }
      }
      @keyframes float-gentle {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(2deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { 
          text-shadow: 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
        }
        50% { 
          text-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.3);
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
        }
      }
      @keyframes skill-glow {
        0%, 100% { box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        50% { box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2); }
      }
      @keyframes morph-slow {
        0%, 100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
        25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
        50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
        75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
      }
      @keyframes slide-up {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `
    document.head.appendChild(style)

    createParticles()

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
      if (document.head.contains(style)) document.head.removeChild(style)
    }
  }, [])

  const containerStyle = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0e4b99 100%)',
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
    transition: 'all 0.3s ease'
  }

  const skillCardStyle = {
    ...glassCardStyle,
    padding: '2rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    animation: 'float-gentle 6s ease-in-out infinite'
  }

  const techSkills = [
    { name: 'MERN Stack', icon: '⚛️', color: '#61dafb', desc: 'MongoDB, Express, React, Node.js' },
    { name: 'Python', icon: '🐍', color: '#3776ab', desc: 'Backend development & AI/ML' },
    { name: 'PHP Frameworks', icon: '🔧', color: '#777bb4', desc: 'Laravel, CodeIgniter' },
    { name: 'Angular 16', icon: '🅰️', color: '#dd0031', desc: 'Frontend framework' },
    { name: 'Databases', icon: '🗄️', color: '#336791', desc: 'MySQL, MongoDB' },
    { name: 'Tools', icon: '⚙️', color: '#f05032', desc: 'Git, Figma, WordPress' }
  ]

  const languages = [
    { name: 'Tamil', level: 'Native', percentage: 100 },
    { name: 'English', level: 'Professional', percentage: 85 },
    { name: 'Kannada', level: 'Professional', percentage: 80 },
    { name: 'Hindi', level: 'Limited Working', percentage: 60 }
  ]

  return (
    <div style={containerStyle} ref={aboutRef}>
      {/* Particles */}
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
      
      {/* Floating geometric shapes */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '8rem',
        height: '8rem',
        background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
        animation: 'morph-slow 12s ease-in-out infinite',
        opacity: 0.4
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        width: '12rem',
        height: '12rem',
        background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
        animation: 'morph-slow 12s ease-in-out infinite',
        animationDelay: '-6s',
        opacity: 0.3
      }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '6rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: 900,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: 'pulse-glow 3s ease-in-out infinite alternate'
          }}>
            About Me
          </h1>
          <div style={{
            width: '6rem',
            height: '0.25rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            margin: '0 auto',
            borderRadius: '9999px'
          }}></div>
        </div>

        {/* Main Content Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '3rem',
          marginBottom: '6rem'
        }}>
          {/* Bio Card */}
          <div style={{
            ...glassCardStyle,
            padding: '3rem',
            opacity: showElements ? 1 : 0,
            transform: showElements ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease-out 0.2s',
            animation: 'float-gentle 8s ease-in-out infinite'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#6366f1'
            }}>
              👋 Hello There!
            </h2>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: '#d1d5db',
              marginBottom: '1.5rem'
            }}>
              I'm Emmanuel N, a passionate Full Stack Developer from Bengaluru, Karnataka. I specialize in creating scalable, 
              efficient, and user-focused applications with expertise in both frontend and backend technologies.
            </p>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: '#d1d5db',
              marginBottom: '2rem'
            }}>
              Currently strengthening my full stack expertise and exploring AI/ML to transition into an AI Developer. 
              I love building impactful tech solutions that make a difference.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                📍 Bengaluru, India
              </span>
              <span style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#d8b4fe',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                🎓 Bsc Graduate 2025
              </span>
            </div>
          </div>

          {/* Experience Card */}
          <div style={{
            ...glassCardStyle,
            padding: '3rem',
            opacity: showElements ? 1 : 0,
            transform: showElements ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease-out 0.4s',
            animation: 'float-gentle 8s ease-in-out infinite',
            animationDelay: '-2s'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#a855f7'
            }}>
              💼 Experience
            </h2>
            <div style={{ space: '1.5rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  Full-stack Developer
                </h3>
                <p style={{ color: '#6366f1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  EchoPx Technologies • July 2025 - Present
                </p>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                  Building scalable applications with Python and MERN stack
                </p>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  Python Developer
                </h3>
                <p style={{ color: '#6366f1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  EchoPx Technologies • June 2025 - July 2025
                </p>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                  Learning Python, AI tools, and building simple programs
                </p>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  Web Developer
                </h3>
                <p style={{ color: '#6366f1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Kristu Jayanti College • June 2024 - July 2024
                </p>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                  Developed web applications and enhanced coding skills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        <div style={{
          marginBottom: '6rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out 0.6s'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#3b82f6'
          }}>
            🚀 Technical Skills
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {techSkills.map((skill, index) => (
              <div
                key={skill.name}
                style={{
                  ...skillCardStyle,
                  animationDelay: `${index * 0.5}s`,
                  transform: activeSkill === skill.name ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: activeSkill === skill.name 
                    ? '0 25px 50px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : '0 15px 35px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
                onMouseEnter={() => setActiveSkill(skill.name)}
                onMouseLeave={() => setActiveSkill(null)}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {skill.icon}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: skill.color,
                  textAlign: 'center'
                }}>
                  {skill.name}
                </h3>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  lineHeight: 1.5
                }}>
                  {skill.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div style={{
          ...glassCardStyle,
          padding: '3rem',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out 0.8s'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#f59e0b'
          }}>
            🌍 Languages
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {languages.map((lang) => (
              <div key={lang.name} style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#f8fafc'
                  }}>
                    {lang.name}
                  </h3>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6366f1',
                    fontWeight: 500
                  }}>
                    {lang.level}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${lang.percentage}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    borderRadius: '9999px',
                    transition: 'width 1s ease-out 1s'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div style={{
          textAlign: 'center',
          opacity: showElements ? 1 : 0,
          transform: showElements ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out 1s'
        }}>
          <p style={{
            fontSize: '1.25rem',
            color: '#d1d5db',
            marginBottom: '2rem',
            fontWeight: 300
          }}>
            Ready to build something amazing together?
          </p>
          <button style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1rem 2.5rem',
            borderRadius: '9999px',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.05)'
            e.target.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)'
          }}>
            Let's Connect! 🤝
          </button>
        </div>
      </div>
    </div>
  )
}