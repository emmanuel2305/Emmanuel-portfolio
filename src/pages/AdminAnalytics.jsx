import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { getAnalytics, getBlogs, getProjects, getServiceBookings, getAllUsers } from '../services/firebaseService'

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [showElements, setShowElements] = useState(false)
  const [timeRange, setTimeRange] = useState('30') // days
  const [analytics, setAnalytics] = useState({
    users: { total: 0, active: 0, googleUsers: 0, emailUsers: 0 },
    blogs: { total: 0, published: 0, drafts: 0 },
    projects: { total: 0, published: 0, drafts: 0 },
    bookings: { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 },
    messages: { total: 0, unread: 0, read: 0 }
  })
  const [chartData, setChartData] = useState({
    contentOverTime: [],
    servicesByStatus: [],
    userGrowth: [],
    contentBreakdown: []
  })

  useEffect(() => {
    document.body.style.fontFamily = 'Inter, sans-serif'
    document.body.style.background = '#0f0f0f'
    document.body.style.color = '#f0f0f0'
    
    setTimeout(() => setShowElements(true), 300)
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      const [analyticsData, blogs, projects, bookings, users] = await Promise.all([
        getAnalytics(),
        getBlogs(),
        getProjects(),
        getServiceBookings(),
        getAllUsers()
      ])

      setAnalytics(analyticsData)

      // Generate chart data
      generateChartData(blogs, projects, bookings, users)

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = (blogs, projects, bookings, users) => {
    const days = parseInt(timeRange)
    const now = new Date()
    const timeRangeData = []

    // Content over time
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      const blogsOnDay = blogs.filter(b => {
        const createdDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return createdDate.toDateString() === date.toDateString()
      }).length

      const projectsOnDay = projects.filter(p => {
        const createdDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt)
        return createdDate.toDateString() === date.toDateString()
      }).length

      timeRangeData.push({
        date: dateStr,
        blogs: blogsOnDay,
        projects: projectsOnDay
      })
    }

    // Services by status
    const servicesByStatus = [
      { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: '#f59e0b' },
      { name: 'Approved', value: bookings.filter(b => b.status === 'approved').length, color: '#06b6d4' },
      { name: 'In Progress', value: bookings.filter(b => b.status === 'in-progress').length, color: '#3b82f6' },
      { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: '#10b981' },
      { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' }
    ]

    // User growth
    const userGrowthData = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      const usersUpToDate = users.filter(u => {
        const createdDate = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt)
        return createdDate <= date
      }).length

      userGrowthData.push({
        date: dateStr,
        users: usersUpToDate
      })
    }

    // Content breakdown
    const contentBreakdown = [
      { name: 'Published Blogs', value: blogs.filter(b => b.published).length, color: '#ef4444' },
      { name: 'Draft Blogs', value: blogs.filter(b => !b.published).length, color: '#f59e0b' },
      { name: 'Published Projects', value: projects.filter(p => p.published).length, color: '#10b981' },
      { name: 'Draft Projects', value: projects.filter(p => !p.published).length, color: '#06b6d4' }
    ]

    setChartData({
      contentOverTime: timeRangeData,
      servicesByStatus,
      userGrowth: userGrowthData,
      contentBreakdown
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

  const statCardStyle = {
    ...glassCardStyle,
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden'
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
            Loading analytics...
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
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 900,
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c, #ef4444)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite'
              }}>
                Analytics Dashboard
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1.125rem' }}>
                Track your platform performance and insights
              </p>
            </div>

            {/* Time Range Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '1rem' }}>
              {['7', '30', '90'].map(days => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: timeRange === days ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'transparent',
                    color: timeRange === days ? '#fff' : '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Total Users */}
          <div style={statCardStyle}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '50%',
              opacity: 0.1
            }}></div>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '0.5rem' }}>
              {analytics.users.total}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Total Users</div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#10b981' }}>
              {analytics.users.active} Active
            </div>
          </div>

          {/* Total Content */}
          <div style={statCardStyle}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              borderRadius: '50%',
              opacity: 0.1
            }}></div>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.5rem' }}>
              {analytics.blogs.total + analytics.projects.total}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Total Content</div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#10b981' }}>
              {analytics.blogs.published + analytics.projects.published} Published
            </div>
          </div>

          {/* Service Requests */}
          <div style={statCardStyle}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              opacity: 0.1
            }}></div>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.5rem' }}>
              {analytics.bookings.total}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Service Requests</div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#f59e0b' }}>
              {analytics.bookings.pending} Pending
            </div>
          </div>

          {/* Completion Rate */}
          <div style={statCardStyle}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              opacity: 0.1
            }}></div>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>
              {analytics.bookings.total > 0 
                ? Math.round((analytics.bookings.completed / analytics.bookings.total) * 100)
                : 0}%
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Completion Rate</div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#10b981' }}>
              {analytics.bookings.completed} Completed
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Content Over Time */}
          <div style={{ ...glassCardStyle, padding: '2rem' }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Content Creation Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.contentOverTime}>
                <defs>
                  <linearGradient id="blogGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="projectGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#f8fafc'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="blogs" stroke="#ef4444" fillOpacity={1} fill="url(#blogGradient)" />
                <Area type="monotone" dataKey="projects" stroke="#10b981" fillOpacity={1} fill="url(#projectGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth */}
          <div style={{ ...glassCardStyle, padding: '2rem' }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              User Growth
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#f8fafc'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '2rem'
        }}>
          {/* Services by Status */}
          <div style={{ ...glassCardStyle, padding: '2rem' }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Services by Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.servicesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.servicesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Content Breakdown */}
          <div style={{ ...glassCardStyle, padding: '2rem' }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Content Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.contentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.contentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}