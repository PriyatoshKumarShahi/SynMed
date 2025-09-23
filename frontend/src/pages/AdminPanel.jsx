import React, { useState } from 'react';
import { AdminProvider, useAdmin } from '../components/AdminContext';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminApp() {
  const { isAdminAuthenticated, adminLogin, adminLogout } = useAdmin();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (credentials) => {
    setLoginLoading(true);
    setLoginError('');

    const result = await adminLogin(credentials.email, credentials.password);
    if (!result.success) setLoginError(result.error);

    setLoginLoading(false);
  };

  const handleLogout = () => {
    adminLogout();
  };

  if (isAdminAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <>
      <AdminLogin
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
}

export default function AdminPanel() {
  return (
    <AdminProvider>
      <AdminApp />
    </AdminProvider>
  );
}
