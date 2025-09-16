import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import QRDisplay from "../components/QRDisplay";
import API from "../utils/api";
import useOffline from "../hooks/useOffline";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

// ✅ Import Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [videos, setVideos] = useState([]);

  // ✅ Map state
  const [position, setPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  useOffline();

  // Load logged-in user
  const loadUser = async () => {
    try {
      const res = await API.get("/user/me");
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  // Load health videos
  const loadVideos = async () => {
    try {
      const API_KEY = "AIzaSyBgZj6ktve3ODe4tquwf3tdIO0L3Hwzw5E";
      const channelIds = [
        "UCsyPEi8BS07G8ZPXmpzIZrg", // MoHFW India
        "UCJ9YHUwbtV0YnrGkAtHn4Qg", // Health Ministry India
        "UCiMhD4jzUoV4-I5P-7FOA1g",
      ];

      let allVideos = [];

      for (const channelId of channelIds) {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=4`
        );
        const data = await res.json();

        if (data.error) {
          console.error("YouTube API error:", data.error);
          continue;
        }

        allVideos = [
          ...allVideos,
          ...data.items.filter((item) => item.id.kind === "youtube#video"),
        ];
      }

      setVideos(allVideos);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  // ✅ Load user location + nearby hospitals (OpenStreetMap Overpass API)
  const loadNearbyHospitals = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);

        try {
          const query = `
            [out:json];
            (
              node["amenity"="hospital"](around:5000,${latitude},${longitude});
              way["amenity"="hospital"](around:5000,${latitude},${longitude});
              relation["amenity"="hospital"](around:5000,${latitude},${longitude});
            );
            out center;
          `;
          const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
          const res = await fetch(url);
          const data = await res.json();

          const hospitalList = data.elements.map((el) => ({
            id: el.id,
            name: el.tags?.name || "Unnamed Hospital",
            lat: el.lat || el.center?.lat,
            lon: el.lon || el.center?.lon,
          }));

          setHospitals(hospitalList);
        } catch (err) {
          console.error("Error loading hospitals:", err);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        toast.error("Unable to fetch location");
      }
    );
  };

  useEffect(() => {
    loadUser();
    loadVideos();
    loadNearbyHospitals();
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
      await API.post("/upload/prescription", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
      await API.post("/upload/test", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
        <Loader
          text={
            uploadType === "prescription"
              ? "Uploading Prescription..."
              : "Uploading Test Result..."
          }
        />
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

            {/* ✅ Health Videos Section */}
            <div className="p-4 bg-white rounded shadow mt-6">
              <h3 className="font-medium mb-4">Health & Hygiene Videos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {videos.map((video) => (
                  <div
                    key={video.id.videoId || video.id.channelId}
                    className="aspect-w-16 aspect-h-9"
                  >
                    <iframe
                      className="w-full h-64 rounded"
                      src={`https://www.youtube.com/embed/${video.id.videoId}`}
                      title={video.snippet.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <p className="mt-2 text-sm font-medium">
                      {video.snippet.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* ✅ End of Health Videos */}

            {/* ✅ Nearby Hospitals Map */}
            <div className="p-4 bg-white rounded shadow mt-6">
              <h3 className="font-medium mb-4">Nearby Hospitals</h3>
              {position ? (
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>Your Location</Popup>
                  </Marker>
                  {hospitals.map((hospital) => (
                    <Marker
                      key={hospital.id}
                      position={[hospital.lat, hospital.lon]}
                    >
                      <Popup>{hospital.name}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <p>Fetching your location...</p>
              )}
            </div>
            {/* ✅ End of Nearby Hospitals */}
          </div>
        </main>
      </div>
    </div>
  );
}
