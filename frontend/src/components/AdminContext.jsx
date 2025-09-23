import React, { createContext, useState, useContext, useEffect } from 'react';
import AdminAPI from '../utils/adminAPI';
import { toast } from 'react-toastify';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    email: '',
    name: '',
  });

  // Admin login
  const adminLogin = async (email, password) => {
    try {
      const response = await AdminAPI.login(email, password);
      if (response.success) {
        setIsAdminAuthenticated(true);
        toast.success('Admin logged in successfully!');
        return { success: true };
      } else {
        toast.error(response.message || 'Invalid credentials');
        return { success: false, error: response.message || 'Invalid credentials' };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Admin logout
  const adminLogout = async () => {
    await AdminAPI.logout();
    setIsAdminAuthenticated(false);
    toast.info('Admin logged out!');
  };

  // Load admin auth state from localStorage
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') setIsAdminAuthenticated(true);
  }, []);

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminCredentials,
      adminLogin,
      adminLogout,
      setAdminCredentials
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
