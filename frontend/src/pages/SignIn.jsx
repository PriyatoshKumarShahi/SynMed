import React, { useState, useContext } from "react";
import API from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react"; // icons
import { toast } from "react-toastify";


export default function SignIn() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const { saveAuth } = useContext(AuthContext);

 const submit = async () => {
  try {
    const res = await API.post("/auth/login", form);
    saveAuth(res.data.token, res.data.user);
    toast.success("Login successful! 👋");
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    toast.error("Login failed. Invalid credentials.");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-6">
      <motion.div
        initial={{ y: -200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-2xl min-h-[60vh] flex flex-col justify-center"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700">
          Welcome Back
        </h2>

        <div className="mt-10 grid gap-6">
          {/* Email Input */}
          <div className="flex items-center border rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
            <Mail className="text-gray-400 mr-3" />
            <input
              placeholder="Email"
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center border rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
            <Lock className="text-gray-400 mr-3" />
            <input
              placeholder="Password"
              type="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        {/* Sign In Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={submit}
            className="px-10 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </div>

        {/* Extra text */}
        <p className="text-center mt-6 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
