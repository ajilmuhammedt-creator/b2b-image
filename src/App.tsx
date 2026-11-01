import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SignIn } from './pages/SignIn';
import { ResetPassword } from './pages/ResetPassword';
import { Studio } from './pages/Studio';
import { History } from './pages/History';
import { AdminUsers } from './pages/AdminUsers';
import { ProtectedRoute } from './components/ProtectedRoute';

function PasswordRecoveryWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRecoveryMode } = useAuth();

  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hasRecoverySignal =
      isRecoveryMode ||
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      search.includes('error_code=') ||
      search.includes('code=');

    if (hasRecoverySignal && location.pathname !== '/reset-password') {
      // Direct immediately to /reset-password preserving query and hash parameters
      navigate('/reset-password' + location.search + location.hash, { replace: true });
    }
  }, [isRecoveryMode, location.pathname, location.search, location.hash, navigate]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <PasswordRecoveryWatcher />
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route
              path="/studio"
              element={
                <ProtectedRoute>
                  <Studio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            {/* Catch-all redirect to sign in */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
