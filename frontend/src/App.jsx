import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VoiceCommands from './components/VoiceCommands';




const PublicPage = React.lazy(() => import('./pages/PublicPage'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const SignIn = React.lazy(() => import('./pages/SignIn'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const MedicalHistory = React.lazy(() => import('./pages/MedicalHistory'));
const PublicRecord = React.lazy(() => import('./pages/PublicRecord'));
const AiChatbotPage = React.lazy(() => import('./pages/AiChatbotPage'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />

          <Route path="/public/:id" element={<PublicRecord />} />
          <Route path="/ai-chatbot" element={<ProtectedRoute><AiChatbotPage /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {/* Toasts */}
        <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />

        {/* Voice Commands - always listening on all pages */}
        <VoiceCommands />
      </Suspense>
    </AuthProvider>
  );
}
