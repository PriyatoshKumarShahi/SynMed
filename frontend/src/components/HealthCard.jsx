import React, { useRef } from "react";
import html2canvas from "html2canvas";

export default function HealthCard({ user, qrDataUrl }) {
  const ref = useRef();

  const download = async () => {
    const canvas = await html2canvas(ref.current, { useCORS: true });
    const link = document.createElement("a");
    link.download = `${user.name || "healthcard"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const fallbackLetter = user?.name ? user.name[0].toUpperCase() : "";

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        className="relative w-80 h-[500px] bg-white rounded-3xl shadow-xl mx-auto flex flex-col items-center overflow-hidden p-4"
      >
        {/* App Title */}
        <div className="w-full relative py-3 text-gray-800 text-3xl font-bold tracking-wide text-center rounded-xl mb-2">
          SynMed Card
        </div>

        {/* Profile Picture */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mt-4 flex items-center justify-center bg-blue-200 text-5xl font-bold text-blue-800 animate-pulse/20">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />
          ) : (
            fallbackLetter
          )}
        </div>

        {/* User Info */}
        <div className="mt-4 text-center text-gray-800">
          <div className="font-bold text-2xl">{user?.name || "Unknown"}</div>
          <div className="text-sm opacity-90">{user?.email || "-"}</div>
        </div>

        {/* Divider */}
        <div className="my-3 w-24 h-1 bg-gray-400 rounded-full"></div>

        {/* Health Details */}
        <div className="w-full grid grid-cols-2 gap-2 text-gray-800 text-sm mt-2">
          {user?.dob && (
            <div className=" px-2 py-1 rounded-lg flex justify-between">
              <span className="font-semibold">DOB:</span>
              <span>{formatDate(user.dob)}</span>
            </div>
          )}
          {user?.bloodGroup && (
            <div className=" px-2 py-1 rounded-lg flex justify-between">
              <span className="font-semibold">Blood Group:</span>
              <span>{user.bloodGroup}</span>
            </div>
          )}
          {user?.allergies && (
            <div className=" px-2 py-1 rounded-lg flex justify-between">
              <span className="font-semibold">Allergies:</span>
              <span>{user.allergies}</span>
            </div>
          )}
          {user?.chronicDiseases && (
            <div className=" px-2 py-1 rounded-lg flex justify-between">
              <span className="font-semibold">Chronic:</span>
              <span>{user.chronicDiseases}</span>
            </div>
          )}
          {user?.phone && (
            <div className=" px-2 py-1 rounded-lg flex justify-between">
              <span className="font-semibold">Phone:</span>
              <span>{user.phone}</span>
            </div>
          )}
          {user?.address && (
            <div className=" px-2 py-1 rounded-lg flex justify-between col-span-2">
              <span className="font-semibold">Address: </span>
              <span> {user.address}</span>
            </div>
          )}
          {user?.emergencyContact && (
            <div className=" px-2 py-1 rounded-lg flex justify-between col-span-2">
              <span className="font-semibold">Emergency:</span>
              <span>{user.emergencyContact}</span>
            </div>
          )}
        </div>

        {/* QR Code - Bottom Right */}
        {qrDataUrl && (
          <div className="absolute bottom-4 right-4 p-2 bg-white/80 rounded-lg shadow-lg">
            <img
              src={qrDataUrl}
              alt="qr"
              crossOrigin="anonymous"
              className="w-24 h-24"
            />
          </div>
        )}
      </div>

      {/* Download Button */}
      <div className="mt-4 text-center">
        <button
          onClick={download}
          className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
        >
          Download Health Card
        </button>
      </div>
    </div>
  );
}
