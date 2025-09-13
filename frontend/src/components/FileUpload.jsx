import React, { useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { queueUpload } from '../utils/offlineSync';

export default function FileUpload({ path, onUploaded }) {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState(""); 
  const [progress, setProgress] = useState(0); // ✅ progress state

  const submit = async () => {
    if (!file) return toast.error('Choose file');
    if (!date) return toast.error('Pick a date');

    if (!navigator.onLine) {
      // queue for offline
      queueUpload({ path, file, date });
      toast.success('Queued for upload when online');
      onUploaded && onUploaded();
      return;
    }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('prescriptionDate', date);

    try {
      await API.post(path, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });

      toast.success('Uploaded');
      setProgress(0);
      setFile(null);
      setDate("");
      onUploaded && onUploaded();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
      setProgress(0);
    }
  };

  return (
    <div className="p-3 space-y-2">
      {/* File input */}
      <input 
        type="file" 
        accept="image/*"
        onChange={e => setFile(e.target.files[0])} 
        className="block"
      />

      {/* Date input */}
      <input 
        type="date" 
        value={date}
        onChange={e => setDate(e.target.value)}
        className="border p-1 rounded"
        required
      />

      {/* Upload button */}
      <div>
        <button 
          onClick={submit} 
          className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
        >
          Upload
        </button>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <progress value={progress} max="100" className="w-full" />
      )}
    </div>
  );
}
