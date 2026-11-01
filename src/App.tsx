import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SignIn } from './pages/SignIn';
import { ResetPassword } from './pages/ResetPassword';
import { Studio } from './pages/Studio';
import { History } from './pages/History';
import { AdminUsers } from './pages/AdminUsers';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
  );
}
