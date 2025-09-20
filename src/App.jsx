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

function App() {
  const [user] = useAuthState(auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/chat"
          element={user ? <ChatInterface /> : <Navigate to="/" />}
        />
        <Route
          path="/story"
          element={user ? <StoryViewer /> : <Navigate to="/" />}
        />
        <Route
          path="/community"
          element={user ? <CommunityWorkspace /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;