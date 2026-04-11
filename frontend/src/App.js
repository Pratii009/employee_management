import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';

// Wrapper for protected routes
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user && user.role === requiredRole ? children : <Navigate to="/" />;
};

// Main App with Router at ROOT
const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/manager" element={<ProtectedRoute requiredRole="manager"><ManagerDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
        <AppContent />
      </div>
    </Router>
  );
};

export default App;