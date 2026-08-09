import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthSync } from '@/hooks/useAuthSync';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import ConfigWarningBanner from '@/components/layout/ConfigWarningBanner';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import ChatPage from '@/pages/ChatPage';
import HealthLogPage from '@/pages/HealthLogPage';
import InsightsPage from '@/pages/InsightsPage';
import ProfilePage from '@/pages/ProfilePage';

export default function App() {
  useAuthSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="log" element={<HealthLogPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
      <ConfigWarningBanner />
    </BrowserRouter>
  );
}
