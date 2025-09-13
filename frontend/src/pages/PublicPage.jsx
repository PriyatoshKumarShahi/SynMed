import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { 
  Heart, 
  Globe, 
  BarChart3, 
  Users, 
  Stethoscope,
  BookOpen,
  IndianRupee,
  UserCheck,
  Hospital,
  CheckCircle,
  ArrowRight,
  Activity,
  Brain
} from 'lucide-react';

// Hardcoded English translations
const translations = {
  hero: {
    title: "Making Healthcare Records Accessible for Every Migrant Worker",
    subtitle: "Secure • Portable • Inclusive",
    description: "Bridging the healthcare gap for millions of migrant workers in Kerala through digital health records, multilingual support, and seamless access across healthcare providers.",
    getStarted: "Get Started",
    learnMore: "Learn More"
  },
  about: {
    title: "Why Synmed?",
    description: "Kerala hosts millions of migrant workers who face significant healthcare challenges. Most lack proper medical history documentation, creating barriers during emergencies and routine healthcare access.",
    medicalGap: "Medical History Gap",
    medicalGapDesc: "3.5 million+ migrant workers in Kerala lack accessible medical records, making emergency healthcare treatment challenging and inefficient.",
    languageBarriers: "Language Barriers", 
    languageBarriersDesc: "Healthcare providers struggle with communication, while workers face documentation challenges in unfamiliar languages and systems.",
    systemIntegration: "System Integration",
    systemIntegrationDesc: "Fragmented healthcare systems across Kerala need unified access to patient records for quality care delivery."
  },
  features: {
    title: "Comprehensive Healthcare Solutions",
    description: "Our platform bridges the healthcare gap with secure, multilingual, and accessible digital health records designed for migrant workers.",
    digitalRecords: "Digital Health Records",
    digitalRecordsDesc: "Secure, comprehensive medical history in one accessible platform",
    multilingual: "Multilingual Support", 
    multilingualDesc: "Available in Malayalam, Hindi, Bengali, and English",
    costEffective: "Cost-Effective",
    costEffectiveDesc: "Reduces duplicate tests & saves time and money for patients and hospitals",
    sustainable: "Sustainable Healthcare",
    sustainableDesc: "Contributes to sustainable local economy",
    healthInsights: "Health Insights",
    healthInsightsDesc: "Track vaccinations, test results, and health checkup records",
    familyRecords: "Family Records",
    familyRecordsDesc: "Manage health records for entire family in one account"
  }
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' }
];

// --- Animated Number ---
const AnimatedNumber = ({ target, suffix = '', prefix = '' }) => {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isVisible) setIsVisible(true);
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setCurrent(prev => {
          const nextVal = Math.round(increment * currentStep);
          if (nextVal >= target) {
            clearInterval(timer);
            return target;
          }
          return nextVal;
        });
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, target]);

  return <div ref={ref} className="text-3xl font-bold text-health-primary">{prefix}{current.toLocaleString()}{suffix}</div>;
};

// --- Animated Pie Chart ---
const AnimatedPieChart = ({ data, type }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.3 });

    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);

  let cumulativePercentage = 0;

  return (

    <div ref={ref} className="flex flex-col items-center">
      
      <div className="relative w-64 h-64 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360;
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
            const isLargeArc = item.percentage > 50 ? 1 : 0;

            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${isLargeArc} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');

            cumulativePercentage += item.percentage;

            return (
              <path key={index} d={pathData} fill={colors[index % colors.length]}
                className={`transition-all duration-[1500ms] ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/90 rounded-full w-20 h-20 flex items-center justify-center shadow-lg text-xs font-semibold text-health-dark">
            {type === 'state' ? 'States' : 'Sectors'}
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
  { state: "Others", percentage: 5, workers: "200K" }
];

const sectorData = [
  { sector: "Construction", percentage: 40 },
  { sector: "Agriculture", percentage: 25 },
  { sector: "Manufacturing", percentage: 15 },
  { sector: "Services", percentage: 12 },
  { sector: "Others", percentage: 8 }
];

// --- Main Page ---
const PublicPage = () => {
  return (

    <div className="min-h-screen bg-background font-inter">
      <Navbar />
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center text-white bg-gradient-to-r from-health-primary to-health-accent">
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{translations.hero.title}</h1>
          <p className="text-xl mb-4 opacity-90">{translations.hero.subtitle}</p>
          <p className="mb-8 opacity-80">{translations.hero.description}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-health-accent text-white px-6 py-3 rounded-lg flex items-center gap-2">{translations.hero.getStarted}<ArrowRight size={18} /></button>
            <button className="bg-gray-200 text-health-dark px-6 py-3 rounded-lg">{translations.hero.learnMore}</button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-health-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{translations.about.title}</h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto">{translations.about.description}</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white shadow p-6 rounded-lg">
              <Brain className="h-12 w-12 text-health-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{translations.about.medicalGap}</h3>
              <p>{translations.about.medicalGapDesc}</p>
            </div>
            <div className="bg-white shadow p-6 rounded-lg">
              <Globe className="h-12 w-12 text-health-secondary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{translations.about.languageBarriers}</h3>
              <p>{translations.about.languageBarriersDesc}</p>
            </div>
            <div className="bg-white shadow p-6 rounded-lg">
              <Hospital className="h-12 w-12 text-health-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{translations.about.systemIntegration}</h3>
              <p>{translations.about.systemIntegrationDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Section */}
      <section id="data" className="py-20 bg-health-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Migrant Workers in Kerala</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4 flex items-center justify-center"><BarChart3 className="mr-2"/>State-wise Distribution</h3>
              <AnimatedPieChart data={stateData} type="state" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4 flex items-center justify-center"><Users className="mr-2"/>Sector-wise Employment</h3>
              <AnimatedPieChart data={sectorData} type="sector" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-health-dark text-white py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="text-health-accent" /><span className="text-xl font-bold">Synmed</span>
            </div>
            <p className="text-gray-300">Making healthcare accessible for every migrant worker.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-gray-300">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#data">Migrant Data</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;