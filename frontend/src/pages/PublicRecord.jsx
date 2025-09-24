import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../utils/api";

export default function PublicRecord() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
  const load = async () => {
    try {
      const res = await API.get(`/user/public/${id}`);
      setData(res.data);
    } catch (err) {
      console.error("Error loading public record", err);
    }
  };
  load();
}, [id]);


  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Public Record</h2>
      {/* Render prescriptions/tests or whatever the API returns */}
      <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
