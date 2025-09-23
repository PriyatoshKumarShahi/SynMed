// components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== 'admin') {
    // Logged in but not admin
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
