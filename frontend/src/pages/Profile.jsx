import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import API from '../utils/api';
import HealthCard from '../components/HealthCard';
import { toast } from "react-toastify";


export default function Profile() {
  const [data, setData] = useState({ user: null, prescriptions: [], tests: [] });
  const [editDetails, setEditDetails] = useState(false);
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await API.get('/user/me');
      setData(res.data);
      setForm(res.data.user);
      setAvatarPreview(res.data.user?.avatar || '');
    }
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const saveAvatar = async () => {
    try {
      if (!avatarFile) return;
      const fd = new FormData();
      fd.append('file', avatarFile);
      const res = await API.post('/upload/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedUser = { ...data.user, avatar: res.data.url };
      setData({ ...data, user: updatedUser });
      setForm(updatedUser);
      setAvatarPreview(res.data.url);
      setAvatarFile(null);
      toast.success("Avatar updated successfully!");

    } catch (err) {
      console.error(err);
      toast.error("Failed to update avatar!");

    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const saveDetails = async () => {
    try {
      await API.put('/user/me', form);
      const res = await API.get('/user/me');
      setData(res.data);
      setEditDetails(false);
      toast.success("Profile details saved successfully!");

    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile details!");

    }
  };

  return (
    <div className="h-screen w-screen bg-blue-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-7xl h-full bg-white rounded-2xl shadow-lg flex overflow-hidden gap-6">
        
        {/* ------------------ Left Column: Health Card ------------------ */}
        <div className="w-1/3 bg-blue-100 flex flex-col items-center justify-center p-6 rounded-l-2xl">
          <HealthCard 
            user={{ ...data.user, avatar: avatarPreview || data.user?.avatar }} 
            qrDataUrl={null} 
          />
        </div>

        {/* ------------------ Right Column: Profile + Avatar ------------------ */}
        <div className="w-2/3 p-6 flex flex-col overflow-y-auto ">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-semibold">Profile</h2>
            <button 
              onClick={() => setEditDetails((p) => !p)} 
              className="text-blue-600 hover:text-blue-800"
            >
              <Pencil size={21} />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex items-center mb-4 space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg flex items-center justify-center bg-blue-200 text-3xl font-bold text-blue-800">
              {avatarPreview || data.user?.avatar ? (
                <img
                  src={avatarPreview || data.user?.avatar}
                  alt="avatar"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              ) : (
                data.user?.name ? data.user.name[0].toUpperCase() : ""
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={handleFileChange}
              />
              {avatarFile && (
  <button
    onClick={saveAvatar}
    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm self-start"
  >
    Save Avatar
  </button>
)}
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 ">
            {editDetails ? (
              <>
                {['name','email','dob','bloodGroup','height','weight','allergies','chronicDiseases','medicines','phone','address','emergencyContact'].map((field) => (
                  <input
                    key={field}
                    name={field}
                    value={form[field] || ''}
                    onChange={handleChange}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    className="border p-1 rounded w-full text-sm"
                  />
                ))}
                <div className="col-span-full flex justify-center mt-2">
  <button
    onClick={saveDetails}
    className="save-btn px-10 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-lg"
  >
    Save Details
  </button>
</div>
              </>
            ) : (
              <>
                <div className="font-bold text-lg">{data.user?.name}</div>
                <div className="text-sm">{data.user?.email}</div>
                {data.user?.dob && <div>DOB: {formatDate(data.user.dob)}</div>}
                {data.user?.bloodGroup && <div>Blood Group: {data.user.bloodGroup}</div>}
                {data.user?.height && <div>Height: {data.user.height} cm</div>}
                {data.user?.weight && <div>Weight: {data.user.weight} kg</div>}
                {data.user?.allergies && <div>Allergies: {data.user.allergies}</div>}
                {data.user?.chronicDiseases && <div>Prior Diseases: {data.user.chronicDiseases}</div>}
                {data.user?.medicines && <div>Medicines: {data.user.medicines}</div>}
                {data.user?.phone && <div>Phone: {data.user.phone}</div>}
                {data.user?.address && <div>Address: {data.user.address}</div>}
                {data.user?.emergencyContact && <div>Emergency: {data.user.emergencyContact}</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
