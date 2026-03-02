import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

function Navbar() {
  const { user, userProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand" onClick={handleNavClick}>
          💰 SupportHub
        </Link>
        
        {user ? (
          <>
            {/* Desktop Menu */}
            <div className="navbar-desktop">
              {userProfile?.isCreator && (
                <Link to="/creator-dashboard" className="navbar-link">
                  📊 Creator Dashboard
                </Link>
              )}
              <Link to="/dashboard" className="navbar-link">
                👤 Dashboard
              </Link>
              <span className="navbar-welcome">Welcome, {userProfile?.username}</span>
              <button className="secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Mobile Menu */}
            <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
              {userProfile?.isCreator && (
                <Link 
                  to="/creator-dashboard" 
                  className="mobile-menu-link"
                  onClick={handleNavClick}
                >
                  📊 Creator Dashboard
                </Link>
              )}
              <Link 
                to="/dashboard" 
                className="mobile-menu-link"
                onClick={handleNavClick}
              >
                👤 Dashboard
              </Link>
              <span className="mobile-menu-welcome">Welcome, {userProfile?.username}</span>
              <button className="secondary mobile-menu-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;
