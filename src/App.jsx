import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase';
import ChatInterface from './components/ChatInterface';
import StoryViewer from './components/StoryViewer';
import IntroPage from './components/IntroPage';
import RegisterPage from './components/RegisterPage';
import AdminLoginPage from './components/AdminLoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import LoginPage from './components/LoginPage';
import CommunityWorkspace from './components/CommunityWorkspace';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';

function App() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500 text-white">Loading...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500 text-white">Error: {error.message}</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-teal-500">
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <>
                  <Navigation />
                  <Dashboard />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/chat"
            element={
              user ? (
                <>
                  <Navigation />
                  <ChatInterface />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/story"
            element={
              user ? (
                <>
                  <Navigation />
                  <StoryViewer />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/community"
            element={
              user ? (
                <>
                  <Navigation />
                  <CommunityWorkspace />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;