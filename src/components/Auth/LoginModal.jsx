import React, { useState } from 'react';
import { X, User, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { addUser, getUserByEmail } from '../../services/firebaseService';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const createUserDocument = async (user, additionalData = {}) => {
    try {
      // Check if user already exists in Firestore
      let existingUser = null;
      try {
        existingUser = await getUserByEmail(user.email);
      } catch (error) {
        console.log('User not found in Firestore, will create new document');
      }
      
      if (!existingUser) {
        // Create new user document in Firestore
        const userData = {
          uid: user.uid,
          name: additionalData.name || user.displayName || user.email.split('@')[0],
          email: user.email,
          photoURL: user.photoURL || null,
          provider: additionalData.provider || 'email',
          role: 'user',
          isActive: true
        };
        
        const userId = await addUser(userData);
        return { id: userId, ...userData };
      }
      
      return existingUser;
    } catch (error) {
      console.error('Error creating user document:', error);
      // Don't throw error here, return basic user data instead
      return {
        uid: user.uid,
        name: additionalData.name || user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL || null,
        provider: additionalData.provider || 'email',
        role: 'user',
        isActive: true
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Debug logs
    console.log('Form submission started');
    console.log('Auth object:', auth);
    console.log('Form data:', { 
      email: formData.email, 
      passwordLength: formData.password.length,
      isSignUp 
    });

    // Validate inputs
    if (!formData.email.trim()) {
      setError('Email address is required');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (isSignUp && !formData.name.trim()) {
      setError('Full name is required for registration');
      setIsLoading(false);
      return;
    }

    try {
      let userCredential;
      const cleanEmail = formData.email.trim().toLowerCase();

      console.log('Attempting Firebase auth with email:', cleanEmail);

      if (isSignUp) {
        console.log('Creating new user account...');
        // Create new account
        userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          formData.password
        );

        console.log('User created successfully:', userCredential.user.uid);

        // Update the user's display name
        if (formData.name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: formData.name.trim()
          });
          console.log('Display name updated');
        }

        // Create user document in Firestore
        const userDoc = await createUserDocument(userCredential.user, {
          name: formData.name.trim(),
          provider: 'email'
        });

        console.log('User document created:', userDoc);

        // Store in localStorage and call onLogin
        localStorage.setItem('user', JSON.stringify(userDoc));
        onLogin(userDoc);

      } else {
        console.log('Signing in existing user...');
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          formData.password
        );

        console.log('User signed in successfully:', userCredential.user.uid);

        // Get or create user document
        const userDoc = await createUserDocument(userCredential.user, {
          provider: 'email'
        });

        console.log('User document retrieved:', userDoc);
        
        // Store in localStorage and call onLogin
        localStorage.setItem('user', JSON.stringify(userDoc));
        onLogin(userDoc);
      }

      // Reset form and close modal
      setFormData({ email: '', password: '', name: '' });
      setShowPassword(false);
      onClose();

    } catch (error) {
      console.error('Auth error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Handle specific Firebase auth errors with more detailed messages
      let errorMessage = 'Authentication failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = isSignUp 
            ? 'Unable to create account. Please check your email and password.' 
            : 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again or reset your password.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please sign in instead or use a different email.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid. Please check the format and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please wait a few minutes before trying again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password authentication is not enabled. Please contact support.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        default:
          errorMessage = `Authentication error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '', name: '' });
    setShowPassword(false);
    setError('');
    onClose();
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  // Check if Firebase is properly initialized
  React.useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, checking Firebase auth:', auth);
      console.log('Firebase app:', auth?.app);
      console.log('Auth current user:', auth?.currentUser);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        padding: '20px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '24px', 
          padding: '40px', 
          width: '440px', 
          maxWidth: '95vw',
          boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          transform: 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #f59e0b)',
            borderRadius: '24px 24px 0 0'
          }} />

          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '32px' 
          }}>
            <div>
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                margin: 0,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.2'
              }}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p style={{ 
                margin: '8px 0 0 0', 
                color: '#6b7280', 
                fontSize: '16px',
                fontWeight: '400'
              }}>
                {isSignUp ? 'Join our community today' : 'Sign in to continue'}
              </p>
            </div>
            <button 
              onClick={handleClose}
              disabled={isLoading}
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: 'none', 
                cursor: isLoading ? 'not-allowed' : 'pointer', 
                color: '#ef4444',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                marginTop: '4px',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.color = '#ef4444';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.5'
            }}>
              <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isSignUp && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    zIndex: 1
                  }} size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      if (error) setError('');
                    }}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    style={{ 
                      width: '100%', 
                      paddingLeft: '48px', 
                      paddingRight: '16px', 
                      paddingTop: '16px', 
                      paddingBottom: '16px', 
                      border: '2px solid #f3f4f6', 
                      borderRadius: '12px',
                      boxSizing: 'border-box',
                      fontSize: '16px',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease',
                      backgroundColor: isLoading ? '#f9fafb' : '#f9fafb',
                      color: 'black',
                      outline: 'none',
                      opacity: isLoading ? 0.6 : 1
                    }}
                    onFocus={(e) => {
                      if (!isLoading) {
                        e.target.style.borderColor = '#4f46e5';
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#f3f4f6';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                    required={isSignUp}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '15px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#1f2937'
              }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  zIndex: 1
                }} size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (error) setError('');
                  }}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                  style={{ 
                    width: '100%', 
                    paddingLeft: '48px', 
                    paddingRight: '16px', 
                    paddingTop: '16px', 
                    paddingBottom: '16px', 
                    border: '2px solid #f3f4f6', 
                    borderRadius: '12px',
                    boxSizing: 'border-box',
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f9fafb',
                    color: 'black',
                    outline: 'none',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onFocus={(e) => {
                    if (!isLoading) {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#f3f4f6';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '15px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#1f2937'
              }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  zIndex: 1
                }} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  style={{ 
                    width: '100%', 
                    paddingLeft: '48px', 
                    paddingRight: '48px', 
                    paddingTop: '16px', 
                    paddingBottom: '16px', 
                    border: '2px solid #f3f4f6', 
                    borderRadius: '12px',
                    boxSizing: 'border-box',
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f9fafb',
                    color: 'black',
                    outline: 'none',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onFocus={(e) => {
                    if (!isLoading) {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#f3f4f6';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    color: '#9ca3af',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s ease',
                    opacity: isLoading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !isLoading && (e.target.style.color = '#4f46e5')}
                  onMouseLeave={(e) => !isLoading && (e.target.style.color = '#9ca3af')}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {isSignUp && (
                <p style={{ 
                  fontSize: '13px', 
                  color: '#6b7280', 
                  margin: '4px 0 0 0' 
                }}>
                  Password must be at least 6 characters
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white',
                padding: '18px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s ease',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(79, 70, 229, 0.4)',
                transform: 'translateY(0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>
          
          {/* Toggle Sign Up/Login */}
          <div style={{ 
            marginTop: '32px', 
            textAlign: 'center', 
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={handleToggleMode}
                disabled={isLoading}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: isLoading ? '#9ca3af' : '#4f46e5', 
                  cursor: isLoading ? 'not-allowed' : 'pointer', 
                  marginLeft: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.textDecoration = 'underline')}
                onMouseLeave={(e) => !isLoading && (e.target.style.textDecoration = 'none')}
              >
                {isSignUp ? 'Sign in instead' : 'Create one now'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default LoginModal;