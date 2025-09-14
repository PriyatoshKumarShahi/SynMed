import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import QRDisplay from '../components/QRDisplay';
import API from '../utils/api';
import useOffline from '../hooks/useOffline';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // ✅ import navbar

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  useOffline();
  const navigate = useNavigate();

  const loadUser = async () => {
    try {
      const res = await API.get('/user/me');
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadUser(); }, []);

  return (
    <div className="min-h-screen flex flex-col">
      
      <Navbar />

      <div className="flex flex-1 pt-16">
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          user={user} 
          onUpload={loadUser} 
        />

        <main className="flex-1 p-6 bg-blue-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome, {user?.name}
            </h2>

            {/* QR Section */}
            <div className="grid md:grid-cols-1 gap-6 mt-6">
              <div className="p-4 bg-white rounded shadow">
                <h3 className="font-medium">Your QR</h3>
                <QRDisplay userId={user?._id} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
