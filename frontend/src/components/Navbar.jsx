import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';   
import { Heart, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();   

  const handleLogout = () => {
    logout();            
    navigate("/");      
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur z-40 border-b">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-20">
        <div className="flex items-center gap-3">
         <img 
  src="/images/logo.png" 
  alt="Logo"
  className="w-24 h-auto ml-10"
/>

          <Link to="/" className="font-bold text-lg text-slate-800">
          
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-slate-700">Home</Link>
          <Link to="/" className="text-slate-700">About</Link>
          <Link to="/ai-chatbot" className="text-slate-700">AI Chatbot</Link>
          <Link to="/" className="text-slate-700">Migrant Data</Link>

          <button 
            onClick={() => setLang(l => l === 'EN' ? 'മലയാളം' : 'EN')} 
            className="px-2 py-1 bg-slate-100 rounded"
          >
            {lang}
          </button>

          {user ? (
            <>
              <Link to="/dashboard" className="px-3 py-1 bg-blue-400 text-white rounded">
                Dashboard
              </Link>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1 text-sm text-red-600"
              >
            <ArrowRight size={16} />    Logout 
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-slate-700">Login</Link>
              <Link to="/signup" className="px-3 py-1 bg-blue-600 text-white rounded">Sign Up</Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setOpen(o => !o)} className="p-2">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="md:hidden bg-white border-t"
          >
            <div className="flex flex-col p-4 gap-3">
              <Link to="/" onClick={() => setOpen(false)}>Home</Link>
              <Link to="/" onClick={() => setOpen(false)}>About</Link>
              <Link to="/" onClick={() => setOpen(false)}>Features</Link>
              <Link to="/" onClick={() => setOpen(false)}>Migrant Data</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="text-green-600 font-semibold">
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setOpen(false); }} 
                    className="flex items-center gap-1 text-red-600 text-left"
                  >
                    Logout <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setOpen(false)}>Login</Link>
                  <Link to="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
