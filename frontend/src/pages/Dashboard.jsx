import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import QRDisplay from "../components/QRDisplay";
import API from "../utils/api";
import useOffline from "../hooks/useOffline";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import SectionLoader from "../components/SectionLoader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      createMarker: () => null, // prevent duplicate markers
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

const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! 👋 Enter your symptoms and I’ll suggest home remedies, yoga, or meditation videos." }
  ]);
  const [input, setInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);



  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoadingReply(true);

    try {
      const res = await API.post("/chatbot/chat", { message: input });
      const botMsg = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error getting response" }]);
    } finally {
      setLoadingReply(false);
    }
  };


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
  setVideoLoading(true); // start loading
  try {
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
    setVideoLoading(false); // ✅ stop loader here
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
    // loadVideos();
    loadNearbyHospitals();
  }, []);

  // ✅ Handle File Uploads
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

        <main className="flex-1 p-6 bg-gray-50 ml-64">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* ✅ Welcome Section */}
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome, {user?.name}
            </h2>

            {/* ✅ QR + Info */}
            <div className="grid md:grid-cols-2 gap-6 mt-6 ml-60  items-stretch">
              <div className="flex flex-col w-1/2 items-center justify-center bg-white rounded-lg shadow p-6">
                <QRDisplay userId={user?._id} />
                <h3 className="font-semibold text-gray-700 mt-4 text-lg">
                  Your Health QR
                </h3>
              </div>
              <div className="flex flex-col -ml-36 mr-36 justify-center bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-700 mb-3 text-lg">
                  How to Use Your QR
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Show this QR code to your nearest doctor to securely share
                  your health records and receive prescriptions accordingly.
                </p>
                <p className="text-gray-600 text-base mt-3 leading-relaxed">
                  Carry it during checkups or emergencies to avoid repeating
                  tests and give doctors instant access to your past treatments.
                </p>
              </div>
            </div>



             <div className="p-6 bg-white rounded-lg h-screen shadow mt-6">
        <h3 className="font-semibold text-gray-700 mb-4 text-lg">AI Health Chatbot 🤖</h3>
        <div className="border rounded-lg p-4 h-5/6 overflow-y-auto bg-gray-50 space-y-3">
          {messages.map((msg, idx) => (
       <div
  key={idx}
  className={`p-4 max-w-2xl rounded-lg ${
    msg.sender === "user"
      ? "bg-blue-500 text-white self-end ml-auto"
      : "bg-gray-100 text-gray-900"
  }`}
>
  {msg.sender === "bot" ? (
  <div className="prose prose-sm md:prose-base space-y-4 text-gray-800">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
      h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-1" {...props} />,
      p: ({node, ...props}) => <p className="mt-2 mb-2 leading-relaxed" {...props} />,
      li: ({node, ...props}) => <li className="ml-4 list-disc" {...props} />,
      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
    }}>
      {msg.text}
    </ReactMarkdown>
  </div>
) : (
  msg.text
)}
</div>
          ))}
          {loadingReply && <p className="text-gray-500">Bot is typing...</p>}
        </div>

        <div className="mt-4 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your symptoms..."
            className="flex-1 border rounded-l-lg p-2 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>

            {/* ✅ Health Videos */}
 <div className="p-6 bg-white rounded-lg shadow">
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



            {/* ✅ Nearby Hospitals */}
            <div className="grid md:grid-cols-2 gap-6 mt-6 items-stretch">
              {/* Left: Map */}
           <div className="flex flex-col justify-center bg-white rounded-lg shadow p-6">
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
        whenReady={() => setMapLoading(false)} // ✅ hide loader once map ready
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
            eventHandlers={{ click: () => setSelectedHospital(hospital) }}
          >
            <Popup>{hospital.name}</Popup>
          </Marker>
        ))}

        {selectedHospital && (
          <RoutingMachine position={position} hospital={selectedHospital} />
        )}
      </MapContainer>
    </>
  ) : (
    <p className="text-gray-500">Fetching your location...</p>
  )}
</div>

</div>



           {/* Right: Scrollable Hospital List */}
<div className="flex flex-col bg-white rounded-lg shadow p-6">
  <h3 className="font-semibold text-gray-700 mb-3 text-lg">
    Hospitals Nearby
  </h3>

  <div className="relative overflow-y-auto max-h-72 space-y-3 pr-2">
    {/* ✅ Loader overlay for hospital list */}
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
      <p className="text-gray-500 text-center">Loading Hospitals...</p>
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
