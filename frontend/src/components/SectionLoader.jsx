import React from "react";

export default function SectionLoader({ text }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-8">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
}
