import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CreatorPage from './pages/CreatorPage';
import CreatorDashboard from './pages/CreatorDashboard';
import MemberDashboard from './pages/MemberDashboard';
import PostDetailPage from './pages/PostDetailPage';

// Components
import Navbar from './components/Navbar';
import Loading from './components/Loading';

function App() {
  const { user, userProfile, loading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/creator/:username" element={<CreatorPage />} />

        {/* Protected routes */}
        {user && userProfile?.isCreator && (
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
        )}
        {user && (
          <>
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
          </>
        )}

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
