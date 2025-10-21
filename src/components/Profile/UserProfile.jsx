import React, { useState } from 'react';
import { User, LogOut, Calendar, Clock, CheckCircle, XCircle, Star, MapPin, Phone, Mail, Settings, Award, TrendingUp } from 'lucide-react';

const UserProfile = ({ user, services, onLogout, onClose }) => {
  const [activeTab, setActiveTab] = useState('services');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-emerald-500" size={16} />;
      case 'cancelled': return <XCircle className="text-red-500" size={16} />;
      case 'in-progress': return <Clock className="text-blue-500" size={16} />;
      default: return <Clock className="text-amber-500" size={16} />;
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    // Handle Firebase Timestamp
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString();
    }
    
    // Handle regular Date object or string
    return new Date(dateValue).toLocaleDateString();
  };

  const stats = {
    total: services.length,
    completed: services.filter(s => s.status === 'completed').length,
    pending: services.filter(s => s.status === 'pending').length,
    inProgress: services.filter(s => s.status === 'in-progress').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div style={{
      width: '380px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      overflow: 'hidden',
      zIndex: 1000,
      position: 'relative'
    }}>
      {/* Header with gradient background */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        padding: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              background: user.photoURL ? 'transparent' : 'linear-gradient(135deg, #ffffff20, #ffffff10)',
              borderRadius: '16px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden'
            }}>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '14px'
                  }}
                  onError={(e) => {
                    console.error('Error loading profile image in UserProfile:', user.photoURL);
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    parent.style.background = 'linear-gradient(135deg, #ffffff20, #ffffff10)';
                    parent.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                  }}
                />
              ) : (
                <User style={{ color: 'white' }} size={24} />
              )}
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontWeight: '700', 
                fontSize: '18px', 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {user.name || 'User'}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Mail size={12} />
                {user.email}
              </p>
              {user.provider && (
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '12px', 
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'capitalize'
                }}>
                  via {user.provider}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer', 
              color: 'white', 
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ×
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '16px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '12px 8px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{stats.total}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: '500' }}>Total</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '12px 8px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{stats.completed}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: '500' }}>Done</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '12px 8px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{completionRate}%</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: '500' }}>Rate</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        background: 'white',
        borderRadius: '20px 20px 0 0',
        marginTop: '-10px',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: 'white',
          borderRadius: '20px 20px 0 0',
          padding: '0 24px'
        }}>
          {[
            { key: 'services', label: 'Services', icon: Calendar },
            { key: 'stats', label: 'Stats', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 0',
                marginRight: '24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === tab.key ? '#4f46e5' : '#6b7280',
                fontWeight: activeTab === tab.key ? '600' : '500',
                fontSize: '14px',
                borderBottom: activeTab === tab.key ? '2px solid #4f46e5' : '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px' }}>
          {activeTab === 'services' && (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h4 style={{ 
                  margin: 0, 
                  fontWeight: '600', 
                  color: '#1f2937',
                  fontSize: '16px'
                }}>
                  My Services ({services.length})
                </h4>
                {services.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#10b981',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <Star size={12} fill="currentColor" />
                    Active Member
                  </div>
                )}
              </div>
              
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {services.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {services.map((service) => (
                      <div key={service.id} style={{ 
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '16px', 
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Status indicator */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '4px',
                          height: '100%',
                          background: service.status === 'completed' ? '#10b981' : 
                                     service.status === 'in-progress' ? '#3b82f6' :
                                     service.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                        }} />
                        
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start', 
                          marginBottom: '10px' 
                        }}>
                          <h5 style={{ 
                            margin: 0, 
                            fontWeight: '600', 
                            fontSize: '14px',
                            color: '#1f2937',
                            lineHeight: '1.4'
                          }}>
                            {service.serviceType || service.title || 'Service Booking'}
                          </h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                            {getStatusIcon(service.status)}
                          </div>
                        </div>
                        
                        <p style={{ 
                          margin: '0 0 12px 0', 
                          fontSize: '12px', 
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>
                          {service.description || service.message || 'No description available'}
                        </p>
                        
                        {service.urgency && (
                          <div style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                            background: service.urgency === 'high' ? '#fee2e2' : 
                                       service.urgency === 'medium' ? '#fef3c7' : '#f0f9ff',
                            color: service.urgency === 'high' ? '#dc2626' : 
                                  service.urgency === 'medium' ? '#d97706' : '#2563eb'
                          }}>
                            {service.urgency} Priority
                          </div>
                        )}
                        
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#6b7280',
                            fontSize: '12px'
                          }}>
                            <Calendar size={12} />
                            {formatDate(service.createdAt || service.bookedAt)}
                          </div>
                          
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            border: '1px solid',
                            backgroundColor: service.status === 'completed' ? '#ecfdf5' : 
                                           service.status === 'in-progress' ? '#eff6ff' :
                                           service.status === 'cancelled' ? '#fef2f2' : '#fffbeb',
                            color: service.status === 'completed' ? '#059669' : 
                                  service.status === 'in-progress' ? '#2563eb' :
                                  service.status === 'cancelled' ? '#dc2626' : '#d97706',
                            borderColor: service.status === 'completed' ? '#d1fae5' : 
                                        service.status === 'in-progress' ? '#dbeafe' :
                                        service.status === 'cancelled' ? '#fecaca' : '#fed7aa'
                          }}>
                            {service.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#6b7280'
                  }}>
                    <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#374151' }}>No services yet</p>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                      Book your first service to get started on your journey!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: 0, fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                Service Statistics
              </h4>
              
              {/* Progress Ring for Completion Rate */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `conic-gradient(#4f46e5 ${completionRate * 3.6}deg, #e5e7eb 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#4f46e5'
                  }}>
                    {completionRate}%
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                  Completion Rate
                </p>
              </div>

              {/* Detailed Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Total Services', value: stats.total, color: '#4f46e5', icon: Calendar },
                  { label: 'Completed', value: stats.completed, color: '#10b981', icon: CheckCircle },
                  { label: 'In Progress', value: stats.inProgress, color: '#3b82f6', icon: Clock },
                  { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: Clock }
                ].map((stat, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color
                      }}>
                        <stat.icon size={16} />
                      </div>
                      <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                        {stat.label}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: stat.color
                    }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div style={{ padding: '0 24px 24px' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              color: '#dc2626',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #fecaca',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
              e.target.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;