import React from "react";

export default function Loader2({ text = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
      <span className="text-blue-700 font-medium">{text}</span>
    </div>
  );
}
