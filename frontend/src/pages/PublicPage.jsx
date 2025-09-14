import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import heroImage from "../assets/healthcare-hero.jpg";

import {
  Heart,
  Globe,
  BarChart3,
  Users,
  Hospital,
  ArrowRight,
  Brain,
  IndianRupee,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";


// --- Count Up Component ---
const CountUpNumber = ({ end, duration = 2000 }) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * end);
      setValue(current);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
};


// --- Translations & Content ---
const translations = {
  hero: {
    title: "Making Healthcare Records Accessible for Every Migrant Worker",
    subtitle: "Secure • Portable • Inclusive",
    description:
      "Bridging the healthcare gap for millions of migrant workers in Kerala through digital health records, multilingual support, and seamless access across healthcare providers.",
    getStarted: "Get Started",
    learnMore: "Learn More",
    highlights: [
      { value: "3.5M+", label: "Migrant Workers" },
      { value: "14", label: "Districts" },
      { value: "85%", label: "Language Barrier" },
      { value: "60%", label: "No Medical History" },
    ],
  },
  about: {
    title: "Why Synmed?",
    description:
      "Kerala hosts millions of migrant workers who face significant healthcare challenges. Most lack proper medical history documentation, creating barriers during emergencies and routine healthcare access.",
    medicalGap: "Medical History Gap",
    medicalGapDesc:
      "3.5 million+ migrant workers in Kerala lack accessible medical records, making emergency healthcare treatment challenging and inefficient.",
    languageBarriers: "Language Barriers",
    languageBarriersDesc:
      "Healthcare providers struggle with communication, while workers face documentation challenges in unfamiliar languages and systems.",
    systemIntegration: "System Integration",
    systemIntegrationDesc:
      "Fragmented healthcare systems across Kerala need unified access to patient records for quality care delivery.",
    govHighlight:
      "Government Data: 85% of migrant workers face language barriers in healthcare",
  },
  features: {
    title: "Comprehensive Healthcare Solutions",
    description:
      "Our platform bridges the healthcare gap with secure, multilingual, and accessible digital health records designed for migrant workers.",
    items: [
      {
        icon: IndianRupee,
        title: "Cost-Effective",
        desc: "Reduces duplicate tests & saves time and money for patients and hospitals",
      },
      {
        icon: Globe,
        title: "Multilingual Support",
        desc: "Available in Malayalam, Hindi, Bengali, and English",
      },
      {
        icon: Brain,
        title: "Digital Health Records",
        desc: "Secure, comprehensive medical history in one accessible platform",
      },
      {
        icon: Activity,
        title: "Health Insights",
        desc: "Track vaccinations, test results, and health checkup records",
      },
      {
        icon: Hospital,
        title: "Family Records",
        desc: "Manage health records for entire family in one account",
      },
      {
        icon: Heart,
        title: "Sustainable Healthcare",
        desc: "Contributes to sustainable local economy",
      },
    ],
  },
  stats: [
    { value: "₹50,000 Cr", label: "Annual Economic Contribution" },
    { value: "14", label: "Districts Across Kerala State" },
    { value: "24/7", label: "Healthcare Access Needed" },
  ],
};

// --- Pie Chart ---
const AnimatedPieChart = ({ data, type }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const colors = ["#6366F1", "#F43F5E", "#22C55E", "#EAB308", "#0EA5E9"];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);

  let cumulativePercentage = 0;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative w-64 h-64 mb-6">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          {data.map((item, index) => {
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle =
              ((cumulativePercentage + item.percentage) / 100) * 360;
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
            const isLargeArc = item.percentage > 50 ? 1 : 0;

            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${isLargeArc} 1 ${x2} ${y2}`,
              `Z`,
            ].join(" ");

            cumulativePercentage += item.percentage;

            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                className={`transition-all duration-[1500ms] ease-out ${
                  isVisible
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-75"
                }`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-md text-sm font-semibold text-gray-700">
            {type === "state" ? "States" : "Sectors"}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Data ---
const stateData = [
  { state: "West Bengal", percentage: 35, workers: "1.2M" },
  { state: "Odisha", percentage: 25, workers: "875K" },
  { state: "Assam", percentage: 20, workers: "700K" },
  { state: "Bihar", percentage: 15, workers: "525K" },
  { state: "Others", percentage: 5, workers: "200K" },
];

const sectorData = [
  { sector: "Construction", percentage: 40 },
  { sector: "Agriculture", percentage: 25 },
  { sector: "Manufacturing", percentage: 15 },
  { sector: "Services", percentage: 12 },
  { sector: "Others", percentage: 8 },
];

// --- Main Page ---
const PublicPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <Navbar />

      {/* Hero with background image */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center text-white"
         style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            {translations.hero.title.split("Accessible")[0]}
            <span className="text-orange-400">Accessible</span>
            {translations.hero.title.split("Accessible")[1]}
          </h1>
          <p className="text-xl mb-4 opacity-90">
            {translations.hero.subtitle}
          </p>
          <p className="mb-8 opacity-80 text-lg">
            {translations.hero.description}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            
             <Link className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition" to="/signup">{translations.hero.getStarted} <ArrowRight /></Link> 
            
            <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-lg hover:bg-white/30 transition">
              {translations.hero.learnMore}
            </button>
          </div>

          {/* Hero Highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {translations.hero.highlights.map((h, idx) => (
              <div
                key={idx}
                className="bg-white/20 backdrop-blur-md rounded-lg p-4 shadow-md"
              >
                <div className="text-2xl font-bold text-orange-300">
                  {h.value}
                </div>
                <div className="text-sm">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {translations.about.title}
          </h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto text-gray-600">
            {translations.about.description}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition">
              <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-xl">
                {translations.about.medicalGap}
              </h3>
              <p className="text-gray-600">
                {translations.about.medicalGapDesc}
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-xl">
                {translations.about.languageBarriers}
              </h3>
              <p className="text-gray-600">
                {translations.about.languageBarriersDesc}
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition">
              <Hospital className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-xl">
                {translations.about.systemIntegration}
              </h3>
              <p className="text-gray-600">
                {translations.about.systemIntegrationDesc}
              </p>
            </div>
          </div>

          {/* Gov Highlight */}
          <div className="mt-8 bg-green-100 text-green-700 p-4 rounded-lg inline-block text-sm font-medium">
            {translations.about.govHighlight}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {translations.features.title}
          </h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto text-gray-600">
            {translations.features.description}
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {translations.features.items.map((f, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <f.icon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-xl">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Section */}
      <section id="data" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-10 text-gray-800">
            Migrant Workers in Kerala
          </h2>
          <p className="text-lg mb-12 text-gray-600 max-w-2xl mx-auto">
            Understanding the scale and impact through government data and
            research insights.
          </p>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-gray-50 rounded-lg shadow p-8">
              <h3 className="font-semibold mb-6 flex items-center justify-center text-lg">
                <BarChart3 className="mr-2 text-indigo-600" /> State-wise
                Distribution
              </h3>
              <AnimatedPieChart data={stateData} type="state" />
              <ul className="mt-4 text-sm text-left text-gray-600">
                {stateData.map((s, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{s.state}</span> —{" "}
                    {s.workers} ({s.percentage}%)
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg shadow p-8">
              <h3 className="font-semibold mb-6 flex items-center justify-center text-lg">
                <Users className="mr-2 text-pink-600" /> Sector-wise Employment
              </h3>
              <AnimatedPieChart data={sectorData} type="sector" />
              <ul className="mt-4 text-sm text-left text-gray-600">
                {sectorData.map((s, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{s.sector}</span> —{" "}
                    {s.percentage}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

{/* Stats Strip */}
<section className="py-12 bg-gray-50 flex justify-center">
  <div className="bg-white shadow-md rounded-2xl px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-8 w-full max-w-4xl">
    {translations.stats.map((s, idx) => (
      <div
        key={idx}
        className={`flex-1 text-center ${
          idx !== translations.stats.length - 1 ? "md:border-r border-gray-200" : ""
        }`}
      >
        <div
          className={`text-2xl font-bold ${
            idx === 0
              ? "text-green-600"
              : idx === 1
              ? "text-blue-600"
              : "text-orange-500"
          }`}
        >
          {/* Animated number only for first stat */}
          {idx === 0 ? (
            <>
              ₹<CountUpNumber end={50000} duration={2000} /> Cr
            </>
          ) : (
            s.value
          )}
        </div>
        <div className="text-sm text-gray-600 mt-1">{s.label}</div>
      </div>
    ))}
  </div>
</section>



      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-10">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="text-orange-500" />
              <span className="text-xl font-bold text-white">Synmed</span>
            </div>
            <p className="text-gray-400 text-sm">
              Making healthcare accessible for every migrant worker through
              digital innovation and inclusive design.
            </p>
            <div className="mt-4 flex gap-3 text-sm">
              <span>English</span>
              <span>മലയാളം</span>
              <span>हिन्दी</span>
            
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#data" className="hover:text-white">
                  Migrant Data
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Healthcare</h3>
            <ul className="space-y-2 text-sm">
              <li>Digital Records</li>
              <li>Emergency Access</li>
              <li>Vaccination Tracking</li>
              <li>Health Insights</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Contact</h3>
            <p className="text-sm">Kerala, India</p>
            <p className="text-sm">contact@synmed.in</p>
            <p className="text-sm">+91 XXXX XXXXX</p>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 text-xs">
          Built by Team SynMed for SIH 2025 • Making healthcare
          accessible for all
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
