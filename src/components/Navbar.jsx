import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function Navbar() {
  const { user, userProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          💰 SupportHub
        </Link>
        <div className="flex">
          {userProfile?.isCreator && (
            <>
              <Link to="/creator-dashboard" className="flex">
                📊 Creator Dashboard
              </Link>
              <button 
                className="primary" 
                onClick={() => navigate('/create-content')}
                style={{ marginRight: '15px' }}
              >
                ✨ Create Content
              </button>
            </>
          )}
          <Link to="/dashboard" className="flex">
            👤 Dashboard
          </Link>
          <span style={{ marginRight: '15px' }}>Welcome, {userProfile?.username}</span>
          <button className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
