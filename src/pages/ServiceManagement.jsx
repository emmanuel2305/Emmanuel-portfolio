import { useState, useEffect } from 'react'
import { 
  getServiceBookings, 
  updateBookingStatus, 
  deleteServiceBooking,
  getUserByUid 
} from '../services/firebaseService'
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  MessageSquare,
  PhoneCall,
  Video,
  Archive,
  Filter,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Timer,
  Star
} from 'lucide-react'

export default function ServiceManagement() {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [showElements, setShowElements] = useState(false)

  useEffect(() => {
    document.body.style.fontFamily = 'Inter, sans-serif'
    document.body.style.background = '#0f0f0f'
    document.body.style.color = '#f0f0f0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'

    setTimeout(() => setShowElements(true), 300)
    loadBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, statusFilter, searchTerm])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const bookingsData = await getServiceBookings()
      
      // Enrich bookings with user data
      const enrichedBookings = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            if (booking.userId) {
              const userData = await getUserByUid(booking.userId)
              return { ...booking, userData }
            }
            return booking
          } catch (error) {
            console.warn(`Could not fetch user data for booking ${booking.id}:`, error)
            return booking
          }
        })
      )
      
      setBookings(enrichedBookings)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.name?.toLowerCase().includes(searchLower) ||
        booking.email?.toLowerCase().includes(searchLower) ||
        booking.company?.toLowerCase().includes(searchLower) ||
        booking.serviceType?.toLowerCase().includes(searchLower) ||
        booking.projectDetails?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredBookings(filtered)
  }

  const updateStatus = async (bookingId, newStatus, notes = '') => {
    try {
      setIsUpdating(true)
      await updateBookingStatus(bookingId, newStatus, notes)
      await loadBookings()
      setShowModal(false)
      setSelectedBooking(null)
      setAdminNotes('')
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert('Failed to update booking status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await deleteServiceBooking(bookingId)
        await loadBookings()
        setShowModal(false)
        setSelectedBooking(null)
      } catch (error) {
        console.error('Error deleting booking:', error)
        alert('Failed to delete booking. Please try again.')
      }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      'in-progress': '#3b82f6',
      completed: '#059669',
      cancelled: '#ef4444',
      rejected: '#dc2626'
    }
    return colors[status] || '#6b7280'
  }

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: '#10b981',
      normal: '#f59e0b',
      high: '#ef4444'
    }
    return colors[urgency] || '#6b7280'
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

  const getStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      inProgress: bookings.filter(b => b.status === 'in-progress').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    }
  }

  const stats = getStats()

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
            Loading service bookings...
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
            Service Management
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.25rem' }}>
            Manage client service requests and track project progress
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {[
            { label: 'Total Bookings', value: stats.total, icon: Users, color: '#6366f1' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: '#f59e0b' },
            { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: '#3b82f6' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#10b981' }
          ].map((stat, index) => (
            <div
              key={stat.label}
              style={{
                ...glassCardStyle,
                padding: '2rem',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '1rem',
                background: `${stat.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: `1px solid ${stat.color}30`
              }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#f8fafc',
                margin: '0 0 0.5rem 0'
              }}>
                {stat.value}
              </h3>
              <p style={{
                color: '#94a3b8',
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{
          ...glassCardStyle,
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: '300px' }}>
                <Search 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={loadBookings}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div style={glassCardStyle}>
          <div style={{ padding: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FileText size={24} style={{ color: '#ef4444' }} />
              Service Bookings ({filteredBookings.length})
            </h2>

            {filteredBookings.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#94a3b8'
              }}>
                <Archive size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  No bookings found
                </h3>
                <p>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms'
                    : 'No service bookings have been submitted yet'}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1.5rem'
              }}>
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    onClick={() => {
                      setSelectedBooking(booking)
                      setShowModal(true)
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1.5rem',
                      alignItems: 'start'
                    }}>
                      {/* Client Info */}
                      <div>
                        <h4 style={{
                          color: '#f8fafc',
                          margin: '0 0 1rem 0',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <User size={18} style={{ color: '#ef4444' }} />
                          {booking.name}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#94a3b8',
                            fontSize: '0.875rem'
                          }}>
                            <Mail size={14} />
                            {booking.email}
                          </div>
                          {booking.phone && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              color: '#94a3b8',
                              fontSize: '0.875rem'
                            }}>
                              <Phone size={14} />
                              {booking.phone}
                            </div>
                          )}
                          {booking.company && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              color: '#94a3b8',
                              fontSize: '0.875rem'
                            }}>
                              <Building size={14} />
                              {booking.company}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div>
                        <h5 style={{
                          color: '#cbd5e1',
                          margin: '0 0 0.5rem 0',
                          fontSize: '1rem',
                          fontWeight: 600
                        }}>
                          {booking.serviceType}
                        </h5>
                        <p style={{
                          color: '#94a3b8',
                          margin: '0 0 1rem 0',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {booking.projectDetails || booking.description || 'No details provided'}
                        </p>
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          fontSize: '0.75rem',
                          color: '#94a3b8'
                        }}>
                          {booking.timeline && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} />
                              {booking.timeline}
                            </div>
                          )}
                          {booking.budget && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <DollarSign size={12} />
                              {booking.budget}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          background: `${getStatusColor(booking.status)}20`,
                          border: `1px solid ${getStatusColor(booking.status)}30`,
                          marginBottom: '1rem'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: getStatusColor(booking.status)
                          }}></div>
                          <span style={{
                            color: getStatusColor(booking.status),
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {booking.status?.replace('-', ' ')}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            background: `${getUrgencyColor(booking.urgency || 'normal')}20`,
                            border: `1px solid ${getUrgencyColor(booking.urgency || 'normal')}30`
                          }}>
                            <span style={{
                              color: getUrgencyColor(booking.urgency || 'normal'),
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}>
                              {booking.urgency || 'normal'} priority
                            </span>
                          </div>
                        </div>

                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {formatDate(booking.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
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
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#f8fafc',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Eye size={24} style={{ color: '#ef4444' }} />
                Service Request Details
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedBooking(null)
                  setAdminNotes('')
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
              >
                ✕
              </button>
            </div>

            {/* Client Information */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#ef4444',
                margin: '0 0 1rem 0',
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                Client Information
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    Name
                  </label>
                  <p style={{ color: '#f8fafc', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                    {selectedBooking.name}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    Email
                  </label>
                  <p style={{ color: '#f8fafc', margin: '0.25rem 0 0 0' }}>
                    {selectedBooking.email}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    Phone
                  </label>
                  <p style={{ color: '#f8fafc', margin: '0.25rem 0 0 0' }}>
                    {selectedBooking.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    Company
                  </label>
                  <p style={{ color: '#f8fafc', margin: '0.25rem 0 0 0' }}>
                    {selectedBooking.company || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#ef4444',
                margin: '0 0 1rem 0',
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                Project Details
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Service Type
                </label>
                <p style={{ color: '#f8fafc', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                  {selectedBooking.serviceType}
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                  Project Description
                </label>
                <p style={{
                  color: '#f8fafc',
                  margin: '0.25rem 0 0 0',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedBooking.projectDetails || selectedBooking.description || 'No details provided'}
                </p>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    Timeline
                  </label>
                  <p style={{ color: '#f8fafc', margin: '0.25rem 0 0 0' }}>
                    {selectedBooking.timeline || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    Budget
                  </label>
                  <p style={{ color: '#f8fafc', margin: '0.25rem 0 0 0' }}>
                    {selectedBooking.budget || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    Priority
                  </label>
                  <p style={{
                    color: getUrgencyColor(selectedBooking.urgency || 'normal'),
                    margin: '0.25rem 0 0 0',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {selectedBooking.urgency || 'Normal'}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#ef4444',
                margin: '0 0 1rem 0',
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                Current Status
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  background: `${getStatusColor(selectedBooking.status)}20`,
                  border: `2px solid ${getStatusColor(selectedBooking.status)}30`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getStatusColor(selectedBooking.status)
                  }}></div>
                  <span style={{
                    color: getStatusColor(selectedBooking.status),
                    fontWeight: 700,
                    textTransform: 'capitalize'
                  }}>
                    {selectedBooking.status?.replace('-', ' ')}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8'
                }}>
                  Created: {formatDate(selectedBooking.createdAt)}
                </div>
              </div>
              {selectedBooking.adminNotes && (
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    Admin Notes
                  </label>
                  <p style={{
                    color: '#f8fafc',
                    margin: '0.25rem 0 0 0',
                    lineHeight: 1.6,
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.5rem',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedBooking.adminNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Actions */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#ef4444',
                margin: '0 0 1rem 0',
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                Quick Contact
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <button
                  onClick={() => window.open(`mailto:${selectedBooking.email}?subject=Regarding Your Service Request&body=Hi ${selectedBooking.name},%0D%0A%0D%0AThank you for your service request. `)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.1)'
                  }}
                >
                  <Mail size={16} />
                  Send Email
                </button>
                
                {selectedBooking.phone && (
                  <button
                    onClick={() => window.open(`tel:${selectedBooking.phone}`)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    <PhoneCall size={16} />
                    Call Client
                  </button>
                )}

                <button
                  onClick={() => window.open('https://meet.google.com/new', '_blank')}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    background: 'rgba(168, 85, 247, 0.1)',
                    color: '#a855f7',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(168, 85, 247, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(168, 85, 247, 0.1)'
                  }}
                >
                  <Video size={16} />
                  Schedule Meeting
                </button>
              </div>
            </div>

            {/* Status Update */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#ef4444',
                margin: '0 0 1rem 0',
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                Update Status
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '0.5rem'
                }}>
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this booking, progress updates, or next steps..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}>
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedBooking.id, 'approved', adminNotes)}
                      disabled={isUpdating}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        opacity: isUpdating ? 0.7 : 1
                      }}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(selectedBooking.id, 'rejected', adminNotes)}
                      disabled={isUpdating}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        opacity: isUpdating ? 0.7 : 1
                      }}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                )}

                {(selectedBooking.status === 'approved' || selectedBooking.status === 'pending') && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'in-progress', adminNotes)}
                    disabled={isUpdating}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      opacity: isUpdating ? 0.7 : 1
                    }}
                  >
                    <Timer size={16} />
                    Start Project
                  </button>
                )}

                {selectedBooking.status === 'in-progress' && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'completed', adminNotes)}
                    disabled={isUpdating}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: 'white',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      opacity: isUpdating ? 0.7 : 1
                    }}
                  >
                    <Star size={16} />
                    Mark Complete
                  </button>
                )}

                {!['cancelled', 'completed'].includes(selectedBooking.status) && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'cancelled', adminNotes)}
                    disabled={isUpdating}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      opacity: isUpdating ? 0.7 : 1
                    }}
                  >
                    <XCircle size={16} />
                    Cancel
                  </button>
                )}
              </div>

              {isUpdating && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}>
                  Updating status...
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <h3 style={{
                color: '#ef4444',
                margin: '0 0 1rem 0',
                fontSize: '1.25rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={20} />
                Danger Zone
              </h3>
              <p style={{
                color: '#fca5a5',
                margin: '0 0 1rem 0',
                fontSize: '0.875rem'
              }}>
                Deleting this booking will permanently remove all associated data. This action cannot be undone.
              </p>
              <button
                onClick={() => deleteBooking(selectedBooking.id)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                <Trash2 size={16} />
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          from { 
            transform: translateY(30px); 
            opacity: 0; 
          }
          to { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
      `}</style>
    </div>
  )
}