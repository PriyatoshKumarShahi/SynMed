import { useEffect, useState } from "react";
import API from "../utils/api";
import { toast } from "react-toastify";
import Loader2 from "../components/Loader";

// Accept props for QR/public view
export default function MedicalHistory({ userId, isQRView = false }) {
  const [data, setData] = useState({ prescriptions: [], tests: [] });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      let res;
      if (isQRView && userId) {
        // ✅ Public mode fetch
        res = await API.get(`/user/public/${userId}`);
      } else {
        // ✅ Logged-in user mode
        res = await API.get("/user/me");
      }
      setData({
        prescriptions: res.data.prescriptions || [],
        tests: res.data.tests || [],
      });
      setUser(res.data.user || res.data); // adapt for both APIs
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [isQRView, userId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // 🚫 Disable delete in QR/public mode
  const handleDeletePrescription = async (id) => {
    if (isQRView) return;
    setLoading(true);
    try {
      await API.delete(`/upload/prescription/${id}`);
      toast.success("Prescription deleted");
      setData((prev) => ({
        ...prev,
        prescriptions: prev.prescriptions.filter((p) => p._id !== id),
      }));
    } catch (err) {
      toast.error("Failed to delete prescription.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (isQRView) return;
    setLoading(true);
    try {
      await API.delete(`/upload/test/${id}`);
      toast.success("Test result deleted");
      setData((prev) => ({
        ...prev,
        tests: prev.tests.filter((t) => t._id !== id),
      }));
    } catch (err) {
      toast.error("Failed to delete test result.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 via-white to-blue-50 min-h-screen flex flex-col items-center">
      {loading && <Loader2 text="Deleting..." />}

      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        {isQRView ? "Public Medical History" : "Medical History"}
      </h2>

      {/* User Profile Section */}
      {user && (
        <div className="bg-white shadow rounded-xl p-6 mb-8 border border-yellow-100 w-full max-w-4xl">
          <div className="flex justify-center mb-6">
            <img
              src={user.avatar || "https://via.placeholder.com/100"}
              alt="User Avatar"
              className="w-28 h-28 rounded-full border-4 border-blue-100 shadow-md"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            <div><p className="text-sm text-slate-500">Name</p><p className="font-semibold">{user.name}</p></div>
            <div><p className="text-sm text-slate-500">Date of Birth</p><p className="font-semibold">{formatDate(user.dob) || "N/A"}</p></div>
            <div><p className="text-sm text-slate-500">Blood Group</p><p className="font-semibold">{user.bloodGroup || "N/A"}</p></div>
            <div><p className="text-sm text-slate-500">Phone</p><p className="font-semibold">{user.phone || "N/A"}</p></div>
            <div><p className="text-sm text-slate-500">Emergency Contact</p><p className="font-semibold">{user.emergencyContact || "N/A"}</p></div>
            <div><p className="text-sm text-slate-500">Height</p><p className="font-semibold">{user.height || "N/A"}</p></div>
            <div><p className="text-sm text-slate-500">Weight</p><p className="font-semibold">{user.weight || "N/A"}</p></div>
            <div><p className="text-sm text-slate-500">Chronic Diseases</p><p className="font-semibold">{user.chronicDiseases || "N/A"}</p></div>
            <div><p className="text-sm text-slate-500">Allergies</p><p className="font-semibold">{user.allergies || "N/A"}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-slate-500">Medicines</p><p className="font-semibold">{user.medicines || "N/A"}</p></div>
          </div>
        </div>
      )}

      {/* Prescriptions */}
      <div className="w-full max-w-4xl">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">Prescriptions</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {data.prescriptions.length > 0 ? (
            data.prescriptions.map((p) => (
              <div key={p._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition relative border border-blue-100">
                <div className="flex justify-center">
                  <img src={p.imageUrl} alt="Prescription" className="w-40 h-40 object-contain cursor-pointer" onClick={() => window.open(p.imageUrl, "_blank")} />
                </div>
                <div className="text-xs text-slate-500 mt-2 text-center">
                  {p.prescriptionDate ? new Date(p.prescriptionDate).toLocaleDateString() : "N/A"}
                </div>
                {!isQRView && (
                  <button onClick={() => handleDeletePrescription(p._id)} className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 shadow">
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-500">No prescriptions uploaded yet.</p>
          )}
        </div>

        {/* Test Results */}
        <h3 className="text-xl font-semibold text-slate-700 mt-8 mb-3">Test Results</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {data.tests.length > 0 ? (
            data.tests.map((t) => (
              <div key={t._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition relative border border-blue-100">
                <div className="flex justify-center">
                  <img src={t.url} alt="Test Result" className="w-40 h-40 object-contain cursor-pointer" onClick={() => window.open(t.url, "_blank")} />
                </div>
                <div className="text-xs text-slate-500 mt-2 text-center">
                  {t.uploadedAt ? new Date(t.uploadedAt).toLocaleDateString() : "N/A"}
                </div>
                {!isQRView && (
                  <button onClick={() => handleDeleteTest(t._id)} className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 shadow">
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-500">No test results uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
