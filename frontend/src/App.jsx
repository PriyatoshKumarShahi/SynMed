import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PublicPage = React.lazy(() => import('./pages/PublicPage'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const SignIn = React.lazy(() => import('./pages/SignIn'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const MedicalHistory = React.lazy(() => import('./pages/MedicalHistory'));
const PublicRecord = React.lazy(() => import('./pages/PublicRecord')); // 👈 dynamic QR page

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/history"
            element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>}
          />
          {/* 👇 dynamic route for QR scanned links */}
          <Route path="/public/:id" element={<PublicRecord />} />
        </Routes>
        {/* ✅ ToastContainer should be outside Routes */}
        <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
      </Suspense>
    </AuthProvider>
  );
}
