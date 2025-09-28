import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getBlogs, 
  getProjects, 
  getServiceBookings,
  getAllUsers 
} from '../services/firebaseService'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [showElements, setShowElements] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    blogs: { total: 0, published: 0, drafts: 0, featured: 0 },
    projects: { total: 0, published: 0, drafts: 0, featured: 0 },
    services: { total: 0, pending: 0, approved: 0, inProgress: 0, completed: 0 },
    users: { total: 0, active: 0 }
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [quickActions] = useState([
    {
      title: 'Add New Blog Post',
      description: 'Create and publish blog content',
      icon: '✍️',
      color: '#ef4444',
      path: '/admin/add-blog',
      gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)'
    },
    {
      title: 'Add New Project',
      description: 'Showcase your latest work',
      icon: '🚀',
      color: '#10b981',
      path: '/admin/add-project',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      title: 'Service Requests',
      description: 'Manage client bookings',
      icon: '📋',
      color: '#3b82f6',
      path: '/admin/service-management',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    },
    {
      title: 'User Management',
      description: 'Handle user accounts',
      icon: '👥',
      color: '#8b5cf6',
      path: '/admin/users',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      title: 'Site Settings',
      description: 'Configure website options',
      icon: '⚙️',
      color: '#f59e0b',
      path: '/admin/settings',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      title: 'Analytics',
      description: 'View performance metrics',
      icon: '📊',
      color: '#06b6d4',
      path: '/admin/analytics',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    }
  ])

  useEffect(() => {
    document.body.style.fontFamily = 'Inter, sans-serif'
    document.body.style.background = '#0f0f0f'
    document.body.style.color = '#f0f0f0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'

    setTimeout(() => setShowElements(true), 300)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load all data concurrently
      const [blogsData, projectsData, servicesData] = await Promise.all([
        getBlogs().catch(() => []),
        getProjects().catch(() => []),
        getServiceBookings().catch(() => [])
      ])

      // Calculate statistics
      const blogStats = {
        total: blogsData.length,
        published: blogsData.filter(b => b.published).length,
        drafts: blogsData.filter(b => !b.published).length,
        featured: blogsData.filter(b => b.featured).length
      }

      const projectStats = {
        total: projectsData.length,
        published: projectsData.filter(p => p.published).length,
        drafts: projectsData.filter(p => !p.published).length,
        featured: projectsData.filter(p => p.featured).length
      }

      const serviceStats = {
        total: servicesData.length,
        pending: servicesData.filter(s => s.status === 'pending').length,
        approved: servicesData.filter(s => s.status === 'approved').length,
        inProgress: servicesData.filter(s => s.status === 'in-progress').length,
        completed: servicesData.filter(s => s.status === 'completed').length
      }

      setStats({
        blogs: blogStats,
        projects: projectStats,
        services: serviceStats,
        users: { total: 0, active: 0 } // Placeholder
      })

      // Generate recent activity
      const activities = []
      
      // Add recent blogs
      blogsData.slice(0, 3).forEach(blog => {
        activities.push({
          id: `blog-${blog.id}`,
          type: 'blog',
          title: blog.title,
          action: blog.published ? 'Published' : 'Drafted',
          time: blog.createdAt,
          icon: '📝',
          color: '#ef4444'
        })
      })

      // Add recent projects
      projectsData.slice(0, 3).forEach(project => {
        activities.push({
          id: `project-${project.id}`,
          type: 'project',
          title: project.title,
          action: project.published ? 'Published' : 'Drafted',
          time: project.createdAt,
          icon: '🚀',
          color: '#10b981'
        })
      })

      // Add recent service requests
      servicesData.slice(0, 3).forEach(service => {
        activities.push({
          id: `service-${service.id}`,
          type: 'service',
          title: `${service.serviceType} - ${service.name}`,
          action: `Status: ${service.status}`,
          time: service.createdAt,
          icon: '📋',
          color: '#3b82f6'
        })
      })

      // Sort by time and take most recent
      activities.sort((a, b) => {
        const timeA = a.time?.toDate ? a.time.toDate() : new Date(a.time || 0)
        const timeB = b.time?.toDate ? b.time.toDate() : new Date(b.time || 0)
        return timeB - timeA
      })

      setRecentActivity(activities.slice(0, 10))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    transition: 'all 0.4s ease'
  }

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
            border: '4px solid rgba(239, 68, 68, 0.3)',
            borderTop: '4px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#cbd5e1', fontSize: '1.125rem' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        opacity: showElements ? 1 : 0,
        transform: showElements ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease-out'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: 900,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c, #ef4444)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite'
          }}>
            Admin Dashboard
          </h1>
          <p style={{ 
            color: '#cbd5e1', 
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Manage your content, track performance, and control your digital presence from one central hub
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {/* Blog Stats */}
          <div style={{
            ...glassCardStyle,
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              borderRadius: '50%',
              opacity: 0.1,
              transform: 'translate(30px, -30px)'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📝
              </div>
              <div>
                <h3 style={{
                  color: '#f8fafc',
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 600
                }}>
                  Blog Posts
                </h3>
                <p style={{
                  color: '#94a3b8',
                  margin: 0,
                  fontSize: '0.875rem'
                }}>
                  Content Management
                </p>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#ef4444',
                  marginBottom: '0.25rem'
                }}>
                  {stats.blogs.total}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Total Posts
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#10b981',
                  marginBottom: '0.25rem'
                }}>
                  {stats.blogs.published}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Published
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#f59e0b',
                  marginBottom: '0.25rem'
                }}>
                  {stats.blogs.drafts}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Drafts
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#8b5cf6',
                  marginBottom: '0.25rem'
                }}>
                  {stats.blogs.featured}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Featured
                </div>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div style={{
            ...glassCardStyle,
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              opacity: 0.1,
              transform: 'translate(30px, -30px)'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🚀
              </div>
              <div>
                <h3 style={{
                  color: '#f8fafc',
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 600
                }}>
                  Projects
                </h3>
                <p style={{
                  color: '#94a3b8',
                  margin: 0,
                  fontSize: '0.875rem'
                }}>
                  Portfolio Items
                </p>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#10b981',
                  marginBottom: '0.25rem'
                }}>
                  {stats.projects.total}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Total Projects
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#22c55e',
                  marginBottom: '0.25rem'
                }}>
                  {stats.projects.published}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Published
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#f59e0b',
                  marginBottom: '0.25rem'
                }}>
                  {stats.projects.drafts}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Drafts
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#8b5cf6',
                  marginBottom: '0.25rem'
                }}>
                  {stats.projects.featured}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Featured
                </div>
              </div>
            </div>
          </div>

          {/* Service Stats */}
          <div style={{
            ...glassCardStyle,
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              opacity: 0.1,
              transform: 'translate(30px, -30px)'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📋
              </div>
              <div>
                <h3 style={{
                  color: '#f8fafc',
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 600
                }}>
                  Service Requests
                </h3>
                <p style={{
                  color: '#94a3b8',
                  margin: 0,
                  fontSize: '0.875rem'
                }}>
                  Client Management
                </p>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#3b82f6',
                  marginBottom: '0.25rem'
                }}>
                  {stats.services.total}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Total Requests
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#f59e0b',
                  marginBottom: '0.25rem'
                }}>
                  {stats.services.pending}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Pending
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#06b6d4',
                  marginBottom: '0.25rem'
                }}>
                  {stats.services.inProgress}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  In Progress
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#10b981',
                  marginBottom: '0.25rem'
                }}>
                  {stats.services.completed}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontWeight: 500
                }}>
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          ...glassCardStyle,
          padding: '3rem',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {quickActions.map((action, index) => (
              <div
                key={action.title}
                onClick={() => navigate(action.path)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: action.gradient,
                  borderRadius: '50%',
                  opacity: 0.1
                }}></div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '1rem',
                    background: action.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 style={{
                      color: '#f8fafc',
                      margin: 0,
                      fontSize: '1.125rem',
                      fontWeight: 600
                    }}>
                      {action.title}
                    </h3>
                  </div>
                </div>
                <p style={{
                  color: '#94a3b8',
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}>
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          ...glassCardStyle,
          padding: '3rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{
              width: '50px',
              height: '50px',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              📈
            </span>
            Recent Activity
          </h2>
          
          {recentActivity.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#94a3b8'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                opacity: 0.5
              }}>
                📭
              </div>
              <h3 style={{ marginBottom: '0.5rem', color: '#cbd5e1' }}>
                No recent activity
              </h3>
              <p>
                Start creating content to see your recent activity here
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.75rem',
                    background: `${activity.color}20`,
                    border: `1px solid ${activity.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem'
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: '#f8fafc',
                      margin: '0 0 0.25rem 0',
                      fontSize: '1rem',
                      fontWeight: 600
                    }}>
                      {activity.title}
                    </h4>
                    <p style={{
                      color: '#94a3b8',
                      margin: 0,
                      fontSize: '0.875rem'
                    }}>
                      {activity.action}
                    </p>
                  </div>
                  <div style={{
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    textAlign: 'right'
                  }}>
                    {formatDate(activity.time)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div style={{
          ...glassCardStyle,
          padding: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{
                color: '#f8fafc',
                margin: '0 0 0.25rem 0',
                fontSize: '1.125rem',
                fontWeight: 600
              }}>
                System Status
              </h3>
              <p style={{
                color: '#94a3b8',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                All systems operational
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
              }}></div>
              <span style={{
                color: '#10b981',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                Online
              </span>
              <button
                onClick={loadDashboardData}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                }}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
        @keyframes slide-in {
          from {
            transform: translateX(-30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}