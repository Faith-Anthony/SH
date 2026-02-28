import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup, signin, error } = useAuthStore();

  const isSignup = searchParams.get('type') === 'signup';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    userType: 'member'
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      if (isSignup) {
        if (!formData.username) {
          setFormError('Username is required');
          setLoading(false);
          return;
        }

        const result = await signup(
          formData.email,
          formData.password,
          formData.username,
          formData.userType
        );

        if (result.success) {
          navigate('/dashboard');
        } else {
          setFormError(result.error);
        }
      } else {
        const result = await signin(formData.email, formData.password);

        if (result.success) {
          navigate('/dashboard');
        } else {
          setFormError(result.error);
        }
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-50px',
          right: '-50px',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          bottom: '-30px',
          left: '-30px',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '20px',
          position: 'relative',
          zIndex: 10,
          animation: 'slideInUp 0.6s ease-out',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '50px 40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '10px',
              fontSize: '32px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'slideInDown 0.6s ease-out',
            }}
          >
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          <p
            style={{
              textAlign: 'center',
              color: '#718096',
              marginBottom: '30px',
              fontSize: '14px',
              animation: 'slideInUp 0.6s ease-out 0.1s both',
            }}
          >
            {isSignup ? 'Build your creator community' : 'Sign in to your account'}
          </p>

          {(formError || error) && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                border: '1px solid #fca5a5',
                animation: 'shake 0.4s ease-in-out',
              }}
            >
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              className="form-group"
              style={{
                marginBottom: '16px',
                animation: 'slideInUp 0.6s ease-out 0.15s both',
              }}
            >
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748', fontSize: '14px' }}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>

            {isSignup && (
              <div
                className="form-group"
                style={{
                  marginBottom: '16px',
                  animation: 'slideInUp 0.6s ease-out 0.2s both',
                }}
              >
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748', fontSize: '14px' }}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a unique username"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
            )}

            <div
              className="form-group"
              style={{
                marginBottom: '16px',
                animation: `slideInUp 0.6s ease-out ${isSignup ? '0.25s' : '0.2s'} both`,
              }}
            >
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748', fontSize: '14px' }}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>

            {isSignup && (
              <div
                className="form-group"
                style={{
                  marginBottom: '24px',
                  animation: 'slideInUp 0.6s ease-out 0.3s both',
                }}
              >
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748', fontSize: '14px' }}>I want to be a:</label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="member">Member (Subscribe to creators)</option>
                  <option value="creator">Creator (Create tiers & content)</option>
                  <option value="both">Both (Member & Creator)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: `slideInUp 0.6s ease-out ${isSignup ? '0.35s' : '0.25s'} both`,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
              }}
            >
              {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
              animation: `slideInUp 0.6s ease-out ${isSignup ? '0.4s' : '0.3s'} both`,
            }}
          >
            <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <a
                href={isSignup ? "/auth?type=signin" : "/auth?type=signup"}
                style={{
                  color: '#667eea',
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  paddingBottom: '2px',
                  borderBottom: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#764ba2';
                  e.target.style.borderBottomColor = '#764ba2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#667eea';
                  e.target.style.borderBottomColor = 'transparent';
                }}
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;