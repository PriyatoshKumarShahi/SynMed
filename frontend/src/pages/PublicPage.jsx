import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function PublicPage(){
  return (
    <div>
      <Navbar />
      <main className="pt-20 max-w-6xl mx-auto p-6">
        <section id="home" className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-4xl font-bold text-sky-700">Synmed — Digital Health Records for Migrant Workers</h1>
            <p className="mt-4 text-slate-600">We help reduce repeated tests, provide portable records, and support multilingual access for Kerala's migrant population.</p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity:1, y:0 }}>
            <img src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb" alt="migrant" className="rounded shadow" />
          </motion.div>
        </section>

        <section id="about" className="mt-12 bg-white p-6 rounded shadow">
          <h2 className="font-semibold text-xl">About</h2>
          <p className="mt-2 text-slate-600">Many migrants lack centralized medical records. Synmed provides a secure, portable, QR-backed record enabling quick access for clinicians and reducing redundant diagnostics.</p>
        </section>

        <section id="features" className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-bold">Reduce repeated tests</h3>
            <p className="text-sm text-slate-600">Store prescriptions & test results to avoid unnecessary repeat diagnostics.</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-bold">Multilingual support</h3>
            <p className="text-sm text-slate-600">UI and quick translations to Malayalam, Hindi, Tamil, and English.</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-bold">Offline-first</h3>
            <p className="text-sm text-slate-600">PWA support allows storing uploads offline and syncing when connection returns.</p>
          </div>
        </section>

        <section id="data" className="mt-8 bg-white p-6 rounded shadow">
          <h3 className="font-semibold">Migrant Data (sample)</h3>
          <p className="text-sm text-slate-600">In production we fetch government datasets and show animated charts here.</p>
        </section>
      </main>
    </div>
  );
}
