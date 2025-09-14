import React, { useRef, useState } from "react";
import { User, FileText, TestTube2, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { toast } from "react-toastify";
import Loader from "./Loader";

export default function Sidebar({ collapsed, setCollapsed, user, onUpload }) {
  const presInputRef = useRef(null);
  const testInputRef = useRef(null);

  // ✅ separate loader states
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);

  const handlePrescriptionClick = () => presInputRef.current.click();
  const handleTestClick = () => testInputRef.current.click();

  const handlePrescriptionChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoadingPrescription(true); // ✅ only prescription loader
    try {
      await API.post("/upload/prescription", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Prescription uploaded successfully!");
      onUpload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload prescription");
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handleTestChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoadingTest(true); // ✅ only test loader
    try {
      await API.post("/upload/test", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Test result uploaded successfully!");
      onUpload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload test result");
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <>
      {/* ✅ show loader depending on which is uploading */}
      {loadingPrescription && <Loader />}
      {loadingTest && <Loader />}

      <motion.aside
        animate={{ width: collapsed ? 80 : 240 }}
        className="bg-white h-screen border-r flex flex-col"
      >
        {/* Header */}
        <div className="p-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-sky-100 w-10 h-10 flex items-center justify-center">
              {user?.name?.charAt(0)}
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

        {/* Nav */}
        <nav className="p-3 space-y-2 flex-1">
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
            <User /> {!collapsed && "Profile"}
          </Link>
          <button className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
            <Globe /> {!collapsed && "Multilingual"}
          </button>
          <Link to="/history" className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
            <FileText /> {!collapsed && "Medical History"}
          </Link>

          {/* Upload prescription */}
          <button
            onClick={handlePrescriptionClick}
            className="flex items-center gap-3 p-2 rounded hover:bg-slate-50"
            disabled={loadingPrescription}
          >
            <FileText /> {!collapsed && "Add Prescription"}
          </button>
          <input
            type="file"
            ref={presInputRef}
            className="hidden"
            onChange={handlePrescriptionChange}
            accept="image/*"
          />

          {/* Upload test */}
          <button
            onClick={handleTestClick}
            className="flex items-center gap-3 p-2 rounded hover:bg-slate-50"
            disabled={loadingTest}
          >
            <TestTube2 /> {!collapsed && "Add Test Result"}
          </button>
          <input
            type="file"
            ref={testInputRef}
            className="hidden"
            onChange={handleTestChange}
            accept="image/*"
          />
        </nav>

        {/* Footer */}
        <div className="p-3 text-xs text-slate-500 border-t">Govt initiatives • Help</div>
      </motion.aside>
    </>
  );
}
