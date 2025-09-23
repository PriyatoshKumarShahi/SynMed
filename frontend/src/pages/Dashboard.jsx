import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import QRDisplay from "../components/QRDisplay";
import API from "../utils/api";
import useOffline from "../hooks/useOffline";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import SectionLoader from "../components/SectionLoader";
import { useNavigate } from "react-router-dom";

// ✅ Leaflet Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// ✅ Fix Leaflet Marker Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Routing Machine Component
const RoutingMachine = ({ position, hospital }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !position || !hospital) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(position[0], position[1]),
        L.latLng(hospital.lat, hospital.lon),
      ],
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      position: "topright",
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, position, hospital]);

  return null;
};

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [videos, setVideos] = useState([]);

  const [position, setPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const navigate = useNavigate();

  useOffline();

  // ✅ Load user
  const loadUser = async () => {
    try {
      const res = await API.get("/user/me");
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const loadVideos = async () => {
    setVideoLoading(true);
    try {
      const channelIds = [
        "UCsyPEi8BS07G8ZPXmpzIZrg",
        "UCJ9YHUwbtV0YnrGkAtHn4Qg",
        "UCiMhD4jzUoV4-I5P-7FOA1g",
      ];

      let allVideos = [];

      for (const channelId of channelIds) {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=4`
        );
        const data = await res.json();

        if (data.error) {
          toast.error("YouTube quota exceeded, try later");
          return;
        }

        allVideos = [
          ...allVideos,
          ...data.items.filter((item) => item.id.kind === "youtube#video"),
        ];
      }

      setVideos(allVideos);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setVideoLoading(false);
    }
  };

  // ✅ Load Nearby Hospitals
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
          const url =
            "https://overpass-api.de/api/interpreter?data=" +
            encodeURIComponent(query);
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

  // ✅ File Upload Handlers
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

  // ✅ Static News Data
  const news = [
    {
      title: "Skill Development Scheme for Migrant Workers",
      description:
        "The Ministry of Skill Development has launched training programs for migrants to boost employment.",
      url: "https://www.msde.gov.in/",
      image:
        "https://ccps.digifootprint.gov.in/static//uploads/2025/04/806a4067aebe65018c15da7d6bf86779.png",
    },
    {
      title: "Free Healthcare for Migrants",
      description:
        "State governments and NGOs are organizing free health check-up camps for migrant workers.",
      url: "https://www.shakshamfoundation.org/healthcare-ngos-in-india-free-medical-camps-shaksham-foundation/",
      image: "https://azbigmedia.com/wp-content/uploads/2023/11/Free-Medical-Camp.jpg",
    },
    {
      title: "Affordable Housing Subsidy for Migrants",
      description:
        "Pradhan Mantri Awas Yojana (PMAY) offers housing subsidies, including for migrant families.",
      url: "https://pmaymis.gov.in/",
      image: "https://pmaymis.gov.in/assets/img/banner/10-Years-of-PMAY-U-Banner.jpg",
    },
    {
      title: "Scholarships for Children of Migrants",
      description:
        "National Scholarship Portal (NSP) provides financial support for children of migrants.",
      url: "https://scholarships.gov.in/",
      image: "https://scholarships.gov.in/public/assets2425/images/banner/Ministry-of-labour.png",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

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

        <main className="flex-1 p-6 ml-64">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* ✅ Welcome */}
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome, {user?.name}
            </h2>

            {/* ✅ QR Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-40 ml-60 items-stretch">
              <div className="flex flex-col w-1/2 items-center mt-20 justify-center rounded-lg p-6">
                <QRDisplay userId={user?._id} />
                <h3 className="font-semibold text-gray-700 mt-4 text-lg">
                  Your Health QR
                </h3>
              </div>
              <div className="flex flex-col -ml-36 mr-36 mt-10 justify-center rounded-lg p-6">
                <h3 className="font-semibold text-gray-700 mb-3 text-4xl">
                  How to Use Your QR
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Show this QR code to your nearest doctor to securely share your
                  health records.
                </p>
                <p className="text-gray-600 text-base mt-3 leading-relaxed">
                  Carry it during checkups or emergencies for instant access to
                  your past treatments.
                </p>
              </div>
            </div>

            {/* ✅ AI Assistant */}
            <div className="p-10 rounded-2xl mt-6 flex items-center justify-between bg-yellow-100 min-h-[90vh]">
              <div className="max-w-xl flex-1 pr-6">
                <h3 className="font-bold text-gray-800 text-3xl mb-4">
                  🤖 Your AI Health Assistant
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                  Meet your personal AI-powered Health Companion!
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-base mb-6">
                  <li>Instant home remedies</li>
                  <li>Yoga & meditation video suggestions</li>
                  <li>Daily wellness health tips</li>
                  <li>Natural healing guidance</li>
                </ul>
                <p className="text-gray-600 text-base mb-6">
                  Remember: It’s not a replacement for professional advice.
                </p>
                <button
                  onClick={() => navigate("/ai-chatbot")}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                  Start Chatting with AI
                </button>
              </div>
              <div className="flex-shrink-0 animate-bounce">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png"
                  alt="AI Assistant"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>

            {/* ✅ Health Videos */}
            <div className="p-6 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-4 text-lg">
                Health & Hygiene Videos
              </h3>
              {videoLoading ? (
                <SectionLoader text="Loading videos..." />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <div
                      key={video.id.videoId || video.id.channelId}
                      className="relative aspect-w-16 aspect-h-9"
                    >
                      <iframe
                        className="w-full h-64 rounded"
                        src={`https://www.youtube.com/embed/${video.id.videoId}`}
                        title={video.snippet.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setVideoLoading(false)}
                      />
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        {video.snippet.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ Immigrant Welfare News */}
            <div className="p-6 rounded-lg bg-gray-50">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Immigrant Welfare News
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {news.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition"
                  >
                    <h4 className="text-lg font-semibold mb-2">
                      {item.title}
                    </h4>

                    {/* 🖼️ Image goes here */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-40 object-cover rounded mb-3"
                      />
                    )}

                    <p className="text-sm text-gray-600">{item.description}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mt-2 block"
                    >
                      Read more
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Nearby Hospitals */}
            <div className="grid md:grid-cols-2 gap-6 mt-6 items-stretch">
              <div className="flex flex-col justify-center rounded-lg p-6">
                <h3 className="font-semibold text-gray-700 mb-4 text-lg">
                  Nearby Hospitals
                </h3>
                <div className="relative">
                  {position ? (
                    <>
                      {mapLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000]">
                          <SectionLoader text="Loading map..." />
                        </div>
                      )}
                      <MapContainer
                        center={position}
                        zoom={13}
                        style={{ height: "300px", width: "100%" }}
                        className="rounded"
                        whenReady={() => setMapLoading(false)}
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
                            eventHandlers={{
                              click: () => setSelectedHospital(hospital),
                            }}
                          >
                            <Popup>{hospital.name}</Popup>
                          </Marker>
                        ))}
                        {selectedHospital && (
                          <RoutingMachine
                            position={position}
                            hospital={selectedHospital}
                          />
                        )}
                      </MapContainer>
                    </>
                  ) : (
                    <p className="text-gray-500">Fetching your location...</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col rounded-lg p-6">
                <h3 className="font-semibold text-gray-700 mb-3 text-lg">
                  Hospitals Nearby
                </h3>
                <div className="relative overflow-y-auto max-h-72 space-y-3 pr-2">
                  {mapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000]">
                      <SectionLoader text="Loading hospitals..." />
                    </div>
                  )}
                  {!mapLoading && hospitals.length > 0 ? (
                    hospitals.map((hospital) => (
                      <button
                        key={hospital.id}
                        onClick={() => setSelectedHospital(hospital)}
                        className={`w-full text-left p-2 rounded hover:bg-blue-100 ${
                          selectedHospital?.id === hospital.id
                            ? "bg-blue-200 font-semibold"
                            : "bg-gray-50"
                        }`}
                      >
                        {hospital.name}
                      </button>
                    ))
                  ) : !mapLoading ? (
                    <p className="text-gray-500 text-center">
                      Loading Hospitals...
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
