import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Animated Number Counter Component
const AnimatedNumber = ({ target, suffix = '', prefix = '' }) => {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = target / steps;
      const stepTime = duration / steps;

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
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isVisible, target]);

  return (
    <div ref={ref} className="text-3xl font-bold text-health-primary">
      {prefix}{current.toLocaleString()}{suffix}
    </div>
  );
};

// Animated Pie Chart Component
const AnimatedPieChart = ({ data, type }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const colors = [
    '#FF6B6B', 
    '#4ECDC4',   
    '#45B7D1', 
    '#96CEB4', 
    '#FFEAA7', 
    '#DDA0DD', 
    '#FFB347' 
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
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
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                className={`transition-all duration-[1500ms] ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                  transformOrigin: '50% 50%',
                  filter: isVisible ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none'
                }}
              />
            );
          })}
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            <div className="text-xs font-semibold text-health-dark">
              {type === 'state' ? 'States' : 'Sectors'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {data.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center space-x-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${index * 100 + 800}ms` }}
          >
            <div 
              className="w-4 h-4 rounded-full shadow-sm"
              style={{
                backgroundColor: colors[index % colors.length]
              }}
            ></div>
            <div className="text-sm">
              <div className="font-medium text-health-dark">
                {type === 'state' ? item.state : item.sector}
              </div>
              <div className="text-muted-foreground">
                {type === 'state' ? `${item.workers} (${item.percentage}%)` : `${item.percentage}%`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// State Distribution Data
const stateData = [
  { state: "West Bengal", percentage: 35, workers: "1.2M" },
  { state: "Odisha", percentage: 25, workers: "875K" },
  { state: "Assam", percentage: 20, workers: "700K" },
  { state: "Bihar", percentage: 15, workers: "525K" },
  { state: "Others", percentage: 5, workers: "200K" }
];

// Sector Distribution Data
const sectorData = [
  { sector: "Construction", percentage: 40 },
  { sector: "Agriculture", percentage: 25 },
  { sector: "Manufacturing", percentage: 15 },
  { sector: "Services", percentage: 12 },
  { sector: "Others", percentage: 8 }
];

const PublicPage = () => {
  const features = [
    {
      icon: Stethoscope,
      title: translations.features.digitalRecords,
      description: translations.features.digitalRecordsDesc
    },
    {
      icon: BookOpen,
      title: translations.features.multilingual,
      description: translations.features.multilingualDesc
    },
    {
      icon: null,
      title: translations.features.costEffective,
      description: translations.features.costEffectiveDesc,
      isRupee: true
    },
    {
      icon: null,
      title: translations.features.sustainable,
      description: translations.features.sustainableDesc,
      isPlant: true
    },
    {
      icon: Activity,
      title: translations.features.healthInsights,
      description: translations.features.healthInsightsDesc
    },
    {
      icon: UserCheck,
      title: translations.features.familyRecords,  
      description: translations.features.familyRecordsDesc
    }
  ];

  const stats = [
    { number: "3.5M+", label: "Migrant Workers", subtitle: "Currently in Kerala" },
    { number: "14", label: "Districts", subtitle: "Across Kerala State" },
    { number: "85%", label: "Language Barrier", subtitle: "Face communication issues" },
    { number: "60%", label: "No Medical History", subtitle: "Available during emergencies" }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${healthcareHero})` }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {translations.hero.title.split('Accessible')[0]}<span className="text-health-accent">Accessible</span>{translations.hero.title.split('Accessible')[1] || ''}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {translations.hero.subtitle}
            </p>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-80">
              {translations.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-health-accent hover:bg-health-accent/90 text-white px-8 py-4 text-lg">
                {translations.hero.getStarted} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" className="bg-health-accent hover:bg-health-accent/90 text-white px-8 py-4 text-lg">
                {translations.hero.learnMore}
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-health-accent">{stat.number}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs opacity-80">{stat.subtitle}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-health-light">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-health-dark mb-6">
              {translations.about.title}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {translations.about.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gradient-card shadow-medium border-0">
              <CardHeader className="text-center pb-4">
                <Brain className="h-12 w-12 text-health-primary mx-auto mb-4" />
                <CardTitle className="text-health-dark">{translations.about.medicalGap}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  {translations.about.medicalGapDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-medium border-0">
              <CardHeader className="text-center pb-4">
                <Globe className="h-12 w-12 text-health-secondary mx-auto mb-4" />
                <CardTitle className="text-health-dark">{translations.about.languageBarriers}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  {translations.about.languageBarriersDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-medium border-0">
              <CardHeader className="text-center pb-4">
                <Hospital className="h-12 w-12 text-health-accent mx-auto mb-4" />
                <CardTitle className="text-health-dark">{translations.about.systemIntegration}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  {translations.about.systemIntegrationDesc}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center bg-health-success/10 border border-health-success/20 rounded-full px-6 py-3">
              <CheckCircle className="h-5 w-5 text-health-success mr-2" />
              <span className="text-health-success font-medium">Government Data: 85% of migrant workers face language barriers in healthcare</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-health-dark mb-6">
              {translations.features.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {translations.features.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-health-primary/10 rounded-full group-hover:bg-health-primary/20 transition-colors">
                      {feature.isRupee ? (
                        <IndianRupee className="h-6 w-6 text-health-primary" />
                      ) : feature.isPlant ? (
                        <span className="text-2xl">🌱</span>
                      ) : feature.icon ? (
                        <feature.icon className="h-6 w-6 text-health-primary" />
                      ) : null}
                    </div>
                    <CardTitle className="text-health-dark">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Migrant Data Section */}
      <section id="data" className="py-20 bg-health-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-health-dark mb-6">
              Migrant Workers in Kerala
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understanding the scale and impact through government data and research insights.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <Card className="bg-white shadow-medium border-0">
              <CardHeader>
                <CardTitle className="text-health-dark flex items-center">
                  <BarChart3 className="h-6 w-6 text-health-primary mr-2" />
                  State-wise Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedPieChart data={stateData} type="state" />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-medium border-0">
              <CardHeader>
                <CardTitle className="text-health-dark flex items-center">
                  <Users className="h-6 w-6 text-health-secondary mr-2" />
                  Sector-wise Employment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedPieChart data={sectorData} type="sector" />
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="inline-block bg-white shadow-medium border-0 p-8">
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <AnimatedNumber target={50000} prefix="₹" suffix=" Cr" />
                  <div className="text-sm text-muted-foreground">Annual Economic Contribution</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-health-secondary">14 Districts</div>
                  <div className="text-sm text-muted-foreground">Across Kerala State</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-health-accent">24/7</div>
                  <div className="text-sm text-muted-foreground">Healthcare Access Needed</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-health-dark text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-health-accent" />
                <span className="text-2xl font-bold">Synmed</span>
              </div>
              <p className="text-gray-300 mb-4">
                Making healthcare accessible for every migrant worker through digital innovation and inclusive design.
              </p>
              <div className="flex space-x-2">
                {languages.map((lang) => (
                  <Button 
                    key={lang.code} 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#home" className="block text-gray-300 hover:text-white transition-colors">Home</a>
                <a href="#about" className="block text-gray-300 hover:text-white transition-colors">About</a>
                <a href="#features" className="block text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#data" className="block text-gray-300 hover:text-white transition-colors">Migrant Data</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Healthcare</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Digital Records</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Emergency Access</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Vaccination Tracking</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Health Insights</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-2 text-gray-300">
                <p>Kerala, India</p>
                <p>contact@synmed.in</p>
                <p>+91 XXXX XXXXXX</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-300">
              Built by Team Synmed for Hackathon 2025 • Making healthcare accessible for all
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;