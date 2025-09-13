import { useEffect, useState } from "react";
import API from "../utils/api";
import { toast } from "react-toastify";


export default function MedicalHistory() {
  const [data, setData] = useState({ prescriptions: [], tests: [] });

  const loadData = async () => {
    try {
      const res = await API.get("/user/me");
      setData({ prescriptions: res.data.prescriptions, tests: res.data.tests });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDeletePrescription = async (id) => {
    try {
      await API.delete(`/upload/prescription/${id}`);
        toast.success("Prescription deleted");

      setData(prev => ({
        ...prev,
        prescriptions: prev.prescriptions.filter(p => p._id !== id)
      }));
    } catch (err) { console.error(err);
      toast.error("Failed to delete prescription.");

     }
  };

  const handleDeleteTest = async (id) => {
    try {
      await API.delete(`/upload/test/${id}`);
      toast.success("Test result deleted");

      setData(prev => ({
        ...prev,
        tests: prev.tests.filter(t => t._id !== id)
      }));
    } catch (err) { console.error(err);
      toast.error("Failed to delete test result.");

     }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Medical History</h2>

      {/* Prescriptions */}
      <h3 className="mt-4 font-medium">Prescriptions</h3>
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        {data.prescriptions.map(p => (
          <div key={p._id} className="bg-white p-3 rounded shadow relative">
            <img
              src={p.imageUrl}
              alt="Prescription"
              className="w-full h-48 object-contain cursor-pointer"
              onClick={() => window.open(p.imageUrl, "_blank")}
            />
            <div className="text-xs text-slate-500 mt-1">
              {p.prescriptionDate ? new Date(p.prescriptionDate).toLocaleDateString() : "N/A"}
            </div>
            <button
              onClick={() => handleDeletePrescription(p._id)}
              className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Test Results */}
      <h3 className="mt-6 font-medium">Test Results</h3>
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        {data.tests.map(t => (
          <div key={t._id} className="bg-white p-3 rounded shadow relative">
            <img
              src={t.url}
              alt="Test Result"
              className="w-full h-48 object-contain cursor-pointer"
              onClick={() => window.open(t.url, "_blank")}
            />
            <div className="text-xs text-slate-500 mt-1">
              {t.uploadedAt ? new Date(t.uploadedAt).toLocaleDateString() : "N/A"}
            </div>
            <button
              onClick={() => handleDeleteTest(t._id)}
              className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
