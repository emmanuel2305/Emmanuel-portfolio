import React, { useState } from 'react';
import { X, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { addUser, getUserByEmail } from '../../services/firebaseService';

const GoogleAuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
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
      const existingUser = await getUserByEmail(user.email);
      
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
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validate email format
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      let userCredential;
      
      if (isSignUp) {
        // Create new account
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Update the user's display name
        if (formData.name) {
          await updateProfile(userCredential.user, {
            displayName: formData.name
          });
        }
        
        // Create user document in Firestore
        const userDoc = await createUserDocument(userCredential.user, {
          name: formData.name,
          provider: 'email'
        });
        
        onAuthSuccess(userDoc);
        
      } else {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Get or create user document
        const userDoc = await createUserDocument(userCredential.user);
        onAuthSuccess(userDoc);
      }
      
      handleClose();
      
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('An error occurred. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create or get user document
      const userDoc = await createUserDocument(user, {
        provider: 'google'
      });
      
      onAuthSuccess(userDoc);
      handleClose();
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-in cancelled');
          break;
        case 'auth/popup-blocked':
          setError('Popup blocked. Please allow popups and try again');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('Account exists with different sign-in method');
          break;
        default:
          setError('Google sign-in failed. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '', name: '' });
    setShowPassword(false);
    setError('');
    setIsSignUp(false);
    onClose();
  };

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
            background: 'linear-gradient(90deg, #4285f4, #db4437, #f4b400, #0f9d58)',
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
                background: 'linear-gradient(135deg, #4285f4, #db4437)',
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
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#ef4444',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.color = 'white';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.target.style.color = '#ef4444';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: 'white',
              color: '#374151',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.3s ease',
              marginBottom: '24px',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.borderColor = '#4285f4';
                e.target.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            <span style={{ padding: '0 16px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isSignUp && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your full name"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '6px',
                color: '#374151'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                required
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '6px',
                color: '#374151'
              }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter your password"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    paddingRight: '48px',
                    border: '2px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #4285f4, #db4437)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s ease',
                marginTop: '8px'
              }}
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          
          {/* Toggle Sign Up/Login */}
          <div style={{ 
            marginTop: '24px', 
            textAlign: 'center', 
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setFormData({ email: '', password: '', name: '' })
                }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#4285f4', 
                  cursor: 'pointer', 
                  marginLeft: '4px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoogleAuthModal;