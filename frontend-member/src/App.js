import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';

const getAuth = () => {
  try {
    return {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || 'null')
    };
  } catch {
    return { token: null, user: null };
  }
};

const ProtectedRoute = ({ children }) => {
  const { token, user } = getAuth();
  const memberRoles = ['employee', 'hq', 'supervisor', 'field_engineer'];

  if (!token || !user) return <Navigate to="/member/login" replace />;
  if (!memberRoles.includes(user.role)) return <Navigate to="/member/login" replace />;

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { token, user } = getAuth();
  const memberRoles = ['employee', 'hq', 'supervisor', 'field_engineer'];

  if (!token || !user) return children;
  if (memberRoles.includes(user.role)) return <Navigate to="/member/dashboard" replace />;

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/member/login"
          element={
            <PublicOnlyRoute>
              <MemberLogin />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/member/login" replace />} />
      </Routes>
    </Router>
  );
}