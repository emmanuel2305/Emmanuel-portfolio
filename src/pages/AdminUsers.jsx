import { useState, useEffect } from 'react'
import { 
  getAllUsers, 
  updateUser, 
  deleteUser,
  getServiceBookings 
} from '../services/firebaseService'

export default function AdminUsers() {
  const [showElements, setShowElements] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterProvider, setFilterProvider] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    googleUsers: 0,
    emailUsers: 0
  })

  useEffect(() => {
    document.body.style.fontFamily = 'Inter, sans-serif'
    document.body.style.background = '#0f0f0f'
    document.body.style.color = '#f0f0f0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'

    setTimeout(() => setShowElements(true), 300)
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, filterRole, filterProvider, filterStatus])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      setUsers(usersData)
      
      // Calculate stats
      const stats = {
        total: usersData.length,
        active: usersData.filter(u => u.isActive !== false).length,
        inactive: usersData.filter(u => u.isActive === false).length,
        admins: usersData.filter(u => u.role === 'admin').length,
        googleUsers: usersData.filter(u => u.provider === 'google').length,
        emailUsers: usersData.filter(u => u.provider === 'email').length
      }
      setUserStats(stats)
      
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.uid?.includes(searchTerm)
      )
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole)
    }

    // Provider filter
    if (filterProvider !== 'all') {
      filtered = filtered.filter(user => user.provider === filterProvider)
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(user => user.isActive !== false)
      } else {
        filtered = filtered.filter(user => user.isActive === false)
      }
    }

    setFilteredUsers(filtered)
  }

  const handleUserClick = async (user) => {
    try {
      // Get user's service bookings using their UID
      const bookings = await getServiceBookings(user.uid)
      setSelectedUser({
        ...user,
        bookings
      })
      setShowUserModal(true)
    } catch (error) {
      console.error('Error loading user details:', error)
      setSelectedUser(user)
      setShowUserModal(true)
    }
  }

  const handleUpdateUserStatus = async (userId, isActive) => {
    try {
      await updateUser(userId, { isActive })
      await loadUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await updateUser(userId, { role })
      await loadUsers()
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role })
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'google': return '🌐'
      case 'email': return '📧'
      default: return '👤'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444'
      case 'user': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (isActive) => {
    return isActive !== false ? '#10b981' : '#ef4444'
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
            Loading users...
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
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite'
          }}>
            👥 User Management
          </h1>
          <p style={{ 
            color: '#cbd5e1', 
            fontSize: '1.125rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{ ...glassCardStyle, padding: '2rem', textAlign: 'center' }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#8b5cf6',
              marginBottom: '0.5rem'
            }}>
              {userStats.total}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Total Users</div>
          </div>
          
          <div style={{ ...glassCardStyle, padding: '2rem', textAlign: 'center' }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#10b981',
              marginBottom: '0.5rem'
            }}>
              {userStats.active}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Active Users</div>
          </div>
          
          <div style={{ ...glassCardStyle, padding: '2rem', textAlign: 'center' }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#ef4444',
              marginBottom: '0.5rem'
            }}>
              {userStats.admins}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Administrators</div>
          </div>
          
          <div style={{ ...glassCardStyle, padding: '2rem', textAlign: 'center' }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#3b82f6',
              marginBottom: '0.5rem'
            }}>
              {userStats.googleUsers}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Google Users</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          ...glassCardStyle,
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or UID..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.1)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                Filter by Provider
              </label>
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="all">All Providers</option>
                <option value="google">Google</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{
          ...glassCardStyle,
          padding: '0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '2rem 2rem 1rem 2rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#f8fafc',
                margin: 0
              }}>
                Users ({filteredUsers.length})
              </h2>
              <button
                onClick={loadUsers}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#94a3b8'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  opacity: 0.5
                }}>
                  👤
                </div>
                <h3 style={{ marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  No users found
                </h3>
                <p>
                  {searchTerm || filterRole !== 'all' || filterProvider !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No users have registered yet'
                  }
                </p>
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      User
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      Role
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      Provider
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      Joined
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: index < filteredUsers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                      onClick={() => handleUserClick(user)}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.name}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '1rem'
                            }}>
                              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                          <div>
                            <div style={{
                              color: '#f8fafc',
                              fontWeight: 600,
                              fontSize: '0.9rem'
                            }}>
                              {user.name || 'Unknown'}
                            </div>
                            <div style={{
                              color: '#94a3b8',
                              fontSize: '0.8rem'
                            }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: `${getRoleColor(user.role)}20`,
                          color: getRoleColor(user.role),
                          border: `1px solid ${getRoleColor(user.role)}30`
                        }}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#cbd5e1',
                          fontSize: '0.9rem'
                        }}>
                          <span style={{ fontSize: '1rem' }}>
                            {getProviderIcon(user.provider)}
                          </span>
                          {user.provider || 'unknown'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: `${getStatusColor(user.isActive)}20`,
                          color: getStatusColor(user.isActive),
                          border: `1px solid ${getStatusColor(user.isActive)}30`
                        }}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateUserStatus(user.id, user.isActive === false)
                            }}
                            style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '0.375rem',
                              border: `1px solid ${user.isActive !== false ? '#ef444430' : '#10b98130'}`,
                              background: `${user.isActive !== false ? '#ef444420' : '#10b98120'}`,
                              color: user.isActive !== false ? '#ef4444' : '#10b981',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setShowUserModal(false)}
          >
            <div
              style={{
                ...glassCardStyle,
                padding: '0',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '2rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1.5rem'
                    }}>
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <h2 style={{
                      color: '#f8fafc',
                      margin: '0 0 0.25rem 0',
                      fontSize: '1.5rem',
                      fontWeight: 700
                    }}>
                      {selectedUser.name || 'Unknown User'}
                    </h2>
                    <p style={{
                      color: '#94a3b8',
                      margin: 0,
                      fontSize: '0.9rem'
                    }}>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    padding: '0.5rem'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '2rem' }}>
                {/* User Details */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    color: '#f8fafc',
                    margin: '0 0 1rem 0',
                    fontSize: '1.125rem',
                    fontWeight: 600
                  }}>
                    User Details
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                      }}>
                        User ID
                      </label>
                      <div style={{
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        {selectedUser.uid}
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                      }}>
                        Role
                      </label>
                      <select
                        value={selectedUser.role || 'user'}
                        onChange={(e) => handleUpdateUserRole(selectedUser.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)',
                          color: '#f8fafc',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                      }}>
                        Provider
                      </label>
                      <div style={{
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>{getProviderIcon(selectedUser.provider)}</span>
                        {selectedUser.provider || 'unknown'}
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                      }}>
                        Status
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: `${getStatusColor(selectedUser.isActive)}20`,
                          color: getStatusColor(selectedUser.isActive),
                          border: `1px solid ${getStatusColor(selectedUser.isActive)}30`
                        }}>
                          {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => {
                            handleUpdateUserStatus(selectedUser.id, selectedUser.isActive === false)
                            setSelectedUser({
                              ...selectedUser,
                              isActive: selectedUser.isActive === false
                            })
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                      }}>
                        Joined
                      </label>
                      <div style={{
                        color: '#f8fafc',
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(selectedUser.createdAt)}
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                      }}>
                        Last Updated
                      </label>
                      <div style={{
                        color: '#f8fafc',
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(selectedUser.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Bookings */}
                <div>
                  <h3 style={{
                    color: '#f8fafc',
                    margin: '0 0 1rem 0',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📋 Service Bookings
                    {selectedUser.bookings && (
                      <span style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {selectedUser.bookings.length}
                      </span>
                    )}
                  </h3>
                  
                  {!selectedUser.bookings || selectedUser.bookings.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        opacity: 0.5
                      }}>
                        📋
                      </div>
                      <div style={{
                        color: '#94a3b8',
                        fontSize: '0.9rem'
                      }}>
                        No service bookings found
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gap: '1rem'
                    }}>
                      {selectedUser.bookings.map((booking, index) => (
                        <div
                          key={booking.id}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '1rem'
                          }}>
                            <div>
                              <h4 style={{
                                color: '#f8fafc',
                                margin: '0 0 0.25rem 0',
                                fontSize: '1rem',
                                fontWeight: 600
                              }}>
                                {booking.serviceType || 'Service Request'}
                              </h4>
                              <div style={{
                                color: '#94a3b8',
                                fontSize: '0.8rem',
                                marginBottom: '0.5rem'
                              }}>
                                {formatDate(booking.createdAt)}
                              </div>
                            </div>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: booking.status === 'completed' ? '#10b98120' :
                                         booking.status === 'in-progress' ? '#3b82f620' :
                                         booking.status === 'approved' ? '#22c55e20' : '#f59e0b20',
                              color: booking.status === 'completed' ? '#10b981' :
                                     booking.status === 'in-progress' ? '#3b82f6' :
                                     booking.status === 'approved' ? '#22c55e' : '#f59e0b',
                              border: `1px solid ${booking.status === 'completed' ? '#10b98130' :
                                                   booking.status === 'in-progress' ? '#3b82f630' :
                                                   booking.status === 'approved' ? '#22c55e30' : '#f59e0b30'}`
                            }}>
                              {booking.status || 'pending'}
                            </span>
                          </div>
                          
                          {booking.description && (
                            <div style={{
                              color: '#cbd5e1',
                              fontSize: '0.875rem',
                              lineHeight: 1.5,
                              marginBottom: '1rem'
                            }}>
                              {booking.description.length > 150 
                                ? `${booking.description.substring(0, 150)}...`
                                : booking.description
                              }
                            </div>
                          )}
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '0.75rem',
                            fontSize: '0.8rem'
                          }}>
                            {booking.budget && (
                              <div>
                                <span style={{ color: '#94a3b8' }}>Budget: </span>
                                <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                                  ${booking.budget}
                                </span>
                              </div>
                            )}
                            {booking.timeline && (
                              <div>
                                <span style={{ color: '#94a3b8' }}>Timeline: </span>
                                <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                                  {booking.timeline}
                                </span>
                              </div>
                            )}
                            {booking.urgency && (
                              <div>
                                <span style={{ color: '#94a3b8' }}>Priority: </span>
                                <span style={{ 
                                  color: booking.urgency === 'urgent' ? '#ef4444' : 
                                         booking.urgency === 'high' ? '#f59e0b' : '#10b981',
                                  fontWeight: 600 
                                }}>
                                  {booking.urgency}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Custom scrollbar for modal */
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  )
}