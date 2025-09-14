import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import QRDisplay from "../components/QRDisplay";
import API from "../utils/api";
import useOffline from "../hooks/useOffline";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState(""); // "prescription" or "test"
  useOffline();

  const loadUser = async () => {
    try {
      const res = await API.get("/user/me");
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Handle Prescription Upload
  const handleUploadPrescription = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setUploadType("prescription");
    setLoading(true);
    try {
      await API.post("/upload/prescription", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Prescription uploaded successfully!");
      loadUser();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload prescription");
    } finally {
      setLoading(false);
      setUploadType("");
    }
  };

  // Handle Test Result Upload
  const handleUploadTest = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setUploadType("test");
    setLoading(true);
    try {
      await API.post("/upload/test", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Test result uploaded successfully!");
      loadUser();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload test result");
    } finally {
      setLoading(false);
      setUploadType("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Loader overlay */}
      {loading && (
        <Loader text={uploadType === "prescription" ? "Uploading Prescription..." : "Uploading Test Result..."} />
      )}

      <div className="flex flex-1 pt-16">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          user={user}
          loading={loading}
          onUploadPrescription={handleUploadPrescription}
          onUploadTest={handleUploadTest}
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
