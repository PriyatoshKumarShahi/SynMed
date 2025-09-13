import React, { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext();
import { toast } from "react-toastify";


export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(()=> {
    const token = localStorage.getItem('token');
    if (!token) { setUser(null); }
  }, []);

  function saveAuth(token, userObj) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
  }

  function logout(){
    localStorage.removeItem('token');
    toast.info("Logged out successfully");

    localStorage.removeItem('user');
    setUser(null);
    
  }

  return <AuthContext.Provider value={{ user, saveAuth, logout }}>{children}</AuthContext.Provider>
}
