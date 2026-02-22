
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Products from './components/Products';
import Leads from './components/Leads';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { ThemeProvider } from './contexts/ThemeContext';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="sidebar-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

const PublicLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ErrorProvider>
            <Routes>
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/products" element={<Products />} />
                <Route path="/leads" element={<Leads />} />
              </Route>

              <Route element={<PublicLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Stand-alone route — must be outside PublicLayout because
                  Supabase creates a temporary session when the email link
                  is clicked. PublicLayout would redirect logged-in users away. */}
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
