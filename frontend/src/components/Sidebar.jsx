import React, { useEffect, useRef } from "react";
import { User, FileText, TestTube2, Globe, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Sidebar({
  collapsed,
  setCollapsed,
  user,
  onUploadPrescription,
  onUploadTest,
  loading,
}) {
  const presInputRef = useRef(null);
  const testInputRef = useRef(null);

  const handlePrescriptionClick = () => presInputRef.current.click();
  const handleTestClick = () => testInputRef.current.click();
  
useEffect(() => {
  const handler = (e) => {
    const action = e.detail; // get payload from CustomEvent
    if (action === "prescription" && presInputRef.current) {
      presInputRef.current.click(); // trigger hidden input
    } else if (action === "test" && testInputRef.current) {
      testInputRef.current.click(); // trigger hidden input
    }
  };

  window.addEventListener("voice-upload", handler);
  return () => window.removeEventListener("voice-upload", handler);
}, []);





  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      className="fixed top-0 left-0 h-screen bg-white border-r flex flex-col z-40"
    >
      {/* Header */}
     
<div className="p-3 flex items-center justify-between border-b">
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 flex items-center justify-center bg-blue-200 text-blue-800 font-bold">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt="avatar"
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
        />
      ) : (
        user?.name?.charAt(0)
      )}
    </div>
    {!collapsed && (
      <div>
        <div className="font-bold">{user?.name}</div>
        <div className="text-xs text-slate-500">{user?.email}</div>
      </div>
    )}
  </div>
  <button
    onClick={() => setCollapsed((c) => !c)}
    className="p-1 text-slate-600 hover:text-slate-800"
  >
    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
  </button>
</div>

      {/* Navigation */}
      <nav className="p-3 space-y-2 flex-1 overflow-y-auto">
        <Link to="/profile" className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
          <User /> {!collapsed && "Profile"}
        </Link>
        <button className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
          <Globe /> {!collapsed && "Multilingual"}
        </button>
        <Link to="/history" className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
          <Stethoscope /> {!collapsed && "Medical History"}

        </Link>

        {/* Upload Prescription */}
        <button
        id="upload-prescription-btn"
          onClick={handlePrescriptionClick}
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-50"
          disabled={loading}
        >
          <FileText /> {!collapsed && "Add Prescription"}
        </button>
        <input
          type="file"
          ref={presInputRef}
          className="hidden"
          onChange={onUploadPrescription}
          accept="image/*"
        />

        {/* Upload Test Result */}
        <button
        id="upload-test-btn"
          onClick={handleTestClick}
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-50"
          disabled={loading}
        >
          <TestTube2 /> {!collapsed && "Add Test Result"}
        </button>
        <input
          type="file"
          ref={testInputRef}
          className="hidden"
          onChange={onUploadTest}
          accept="image/*"
        />
      </nav>

      {/* Footer */}
      <div className="p-3 text-xs text-slate-500 border-t">Govt initiatives • Help</div>
    </motion.aside>
  );
}
