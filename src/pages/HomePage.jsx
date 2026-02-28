import { Link } from 'react-router-dom';
import { useState } from 'react';

function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <div className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Animated background orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            animation: 'slideInDown 0.8s ease-out',
            marginBottom: '40px',
          }}>
            <h1 className="hero-title">SupportHub</h1>
            <p className="hero-subtitle">
              The simplest way for creators to earn and manage memberships
            </p>
          </div>

          <div
            className="hero-buttons"
            style={{
              animation: 'slideInUp 0.8s ease-out 0.4s both',
            }}
          >
            <Link to="/auth?type=signin">
              <button
                className="primary"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '14px 32px',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.2)';
                }}
              >
                Sign In
              </button>
            </Link>
            <Link to="/auth?type=signup">
              <button
                className="secondary"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '14px 32px',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 5px 10px rgba(102, 126, 234, 0.1)';
                }}
              >
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          animation: 'slideInUp 0.8s ease-out',
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '800',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Why Choose SupportHub?</h2>
          <p style={{ fontSize: '18px', color: '#718096', maxWidth: '600px', margin: '0 auto' }}>
            Everything creators need to build sustainable communities and earn income
          </p>
        </div>

        <div className="grid">
          {[
            { icon: '👥', title: 'For Creators', desc: 'Build sustainable income by creating membership tiers and sharing exclusive content with your fans.' },
            { icon: '🔒', title: 'Secure Content', desc: 'Share files and posts with tier-based access control. Your content is always protected.' },
            { icon: '💳', title: 'Easy Billing', desc: 'Manage subscriptions, track revenue, and focus on creating great content.' },
          ].map((feature, index) => (
            <div
              key={index}
              className="card text-center"
              style={{
                cursor: 'pointer',
                border: '2px solid #e2e8f0',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: `slideInUp 0.6s ease-out ${0.1 * index}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.2)';
                e.currentTarget.style.borderColor = '#667eea';
                setHoveredFeature(index);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                setHoveredFeature(null);
              }}
            >
              <div
                style={{
                  fontSize: '56px',
                  marginBottom: '20px',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: hoveredFeature === index ? 'scale(1.2) rotateY(10deg)' : 'scale(1)',
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: hoveredFeature === index ? '#667eea' : '#2d3748' }}>{feature.title}</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features List Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%)',
          padding: '80px 20px',
          marginTop: '80px',
        }}
      >
        <div className="container">
          <h2
            style={{
              textAlign: 'center',
              fontSize: '42px',
              fontWeight: '800',
              marginBottom: '60px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'slideInDown 0.8s ease-out',
            }}
          >
            Powerful Features
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            {[
              '✨ Create multiple membership tiers',
              '📝 Post exclusive content',
              '📁 Secure file sharing',
              '💰 Track revenue in real-time',
              '📊 Advanced subscriber management',
              '🔄 Flexible subscription controls',
              '🏄 Member dashboards',
              '🌐 Global creator community',
            ].map((feature, index) => (
              <div
                key={index}
                className="card"
                style={{
                  animation: `slideInUp 0.6s ease-out ${0.08 * index}s both`,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
                }}
              >
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#2d3748', lineHeight: '1.6' }}>{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '80px 20px',
          margin: '80px 0 0 0',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          top: '50%',
          right: '-100px',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <h2
            style={{
              fontSize: '48px',
              fontWeight: '800',
              marginBottom: '20px',
              animation: 'slideInDown 0.8s ease-out',
              letterSpacing: '-1px',
            }}
          >
            Ready to Start Earning?
          </h2>
          <p
            style={{
              fontSize: '20px',
              marginBottom: '40px',
              opacity: 0.95,
              maxWidth: '600px',
              margin: '0 auto 40px',
              animation: 'slideInUp 0.8s ease-out 0.2s both',
            }}
          >
            Join thousands of creators building their communities and earning sustainable income
          </p>
          <Link to="/auth?type=signup">
            <button
              style={{
                fontSize: '18px',
                padding: '16px 40px',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: 'slideInUp 0.8s ease-out 0.4s both',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              Get Started Free
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Stats */}
      <div style={{ padding: '60px 20px', background: '#f8f9ff' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '40px',
              textAlign: 'center',
            }}
          >
            {[
              { number: '10K+', label: 'Active Creators' },
              { number: '500K+', label: 'Supporters' },
              { number: '$50M+', label: 'Creator Earnings' },
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  animation: `slideInUp 0.6s ease-out ${0.1 * index}s both`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <h3 style={{
                  fontSize: '36px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '8px',
                }}>{stat.number}</h3>
                <p style={{ color: '#718096', fontSize: '16px', fontWeight: '500' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
