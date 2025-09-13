import React, { useState, useContext } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Droplets,
  FileText,
  Pill,
  AlertTriangle,
  Home,
  PhoneCall,
  UserCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignUp() {
  const [form, setForm] = useState({});
  const [showPassword, setShowPassword] = useState(false); // ✅ Move inside component
  const navigate = useNavigate();
  const { saveAuth } = useContext(AuthContext);

  const submit = async () => {
    try {
      const res = await API.post("/auth/signup", form);
      saveAuth(res.data.token, res.data.user);
          toast.success("Signup successful");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
          toast.error("Signup failed. Please check your details.");

    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-blue-100 p-4">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl h-[95vh] bg-white p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black">
          Create Your Account
        </h2>

        {/* ================= Account Details ================= */}
        <h3 className="text-xl md:text-2xl font-semibold mt-6 text-black">
          Account Details
        </h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-auto max-h-[40%]">
          {/* Full Name */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <User className="text-gray-400 mr-2" />
            <input
              placeholder="Full Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Email */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <Mail className="text-gray-400 mr-2" />
            <input
              placeholder="Email"
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Password with Eye Toggle */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm relative">
            <Lock className="text-gray-400 mr-2" />
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full outline-none text-sm pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <Phone className="text-gray-400 mr-2" />
            <input
              placeholder="Phone Number"
              type="tel"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* DOB */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <Calendar className="text-gray-400 mr-2" />
            <input
              type="date"
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Gender */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <UserCircle className="text-gray-400 mr-2" />
            <select
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full outline-none text-sm bg-transparent"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Address */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <Home className="text-gray-400 mr-2" />
            <input
              placeholder="Address"
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Emergency Contact */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <PhoneCall className="text-gray-400 mr-2" />
            <input
              placeholder="Emergency Contact"
              onChange={(e) =>
                setForm({ ...form, emergencyContact: e.target.value })
              }
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        {/* ================= Medical Details ================= */}
        <h3 className="text-xl md:text-2xl font-semibold mt-6 text-black">
          Medical Details
        </h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-auto max-h-[40%]">
          {/* Blood Group */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <Droplets className="text-gray-400 mr-2" />
            <input
              placeholder="Blood Group"
              onChange={(e) =>
                setForm({ ...form, bloodGroup: e.target.value })
              }
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Height */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <User className="text-gray-400 mr-2" />
            <input
              placeholder="Height in cm (optional)"
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Weight */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <User className="text-gray-400 mr-2" />
            <input
              placeholder="Weight in kg (optional)"
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Chronic Diseases */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <FileText className="text-gray-400 mr-2" />
            <input
              placeholder="Prior Diseases (if any)"
              onChange={(e) =>
                setForm({ ...form, chronicDiseases: e.target.value })
              }
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Medicines */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <Pill className="text-gray-400 mr-2" />
            <input
              placeholder="Current Medicines (if any)"
              onChange={(e) => setForm({ ...form, medicines: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Allergies */}
          <div className="flex items-center border rounded-lg p-2 md:p-3 shadow-sm">
            <AlertTriangle className="text-gray-400 mr-2" />
            <input
              placeholder="Allergies (if any)"
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        {/* Submit button & Sign In link */}
        <div className="flex flex-col items-center mt-6">
          <button
            onClick={submit}
            className="px-6 py-2 md:px-8 md:py-3 bg-blue-600 text-white text-lg md:text-xl font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Create Account
          </button>

          <p className="mt-3 text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/signin")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
