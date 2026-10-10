import React from 'react';
import {
  Scan,
  Shield,
  Clock,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Cpu,
  Eye,
  Sparkles,
  ChevronRight,
  Database,
  Lock,
} from 'lucide-react';

interface HomePageProps {
  setActivePage: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActivePage }) => {
  const features = [
    {
      icon: <Scan className="w-6 h-6 text-blue-500" />,
      title: 'AI Face Recognition',
      description:
        'Neural network feature extraction mapped to 128-dimensional facial landmark vector descriptors for ultra-high precision matching.',
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: 'Secure Authentication',
      description:
        'Zero-trust authentication flow backed by bcrypt password hashing, JWT authorization tokens, and encrypted vector storage.',
    },
    {
      icon: <Clock className="w-6 h-6 text-cyan-500" />,
      title: 'Attendance Tracking',
      description:
        'Automated real-time attendance logging with precise timestamp, confidence score, IP tracking, and location tagging.',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Real-time Recognition',
      description:
        'Sub-second face detection & vector comparison operating directly in browser with live canvas HUD feedback.',
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      title: 'User Management',
      description:
        'Comprehensive employee roster dashboard with biometric face profile status, attendance records, and role permissions.',
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-teal-500" />,
      title: 'Fast Login',
      description:
        'Frictionless hands-free login experience in under 2 seconds with active anti-spoofing liveness detection.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Register Account',
      desc: 'Enter user profile information, department, and secure credentials.',
    },
    {
      number: '02',
      title: 'Capture Face',
      desc: 'Position face in webcam viewport with optimal lighting and alignment.',
    },
    {
      number: '03',
      title: 'AI Generates Encoding',
      desc: 'Neural engine extracts 68 landmarks and calculates 128-D vector signature.',
    },
    {
      number: '04',
      title: 'Login using Face',
      desc: 'Authenticate instantly via webcam scan with liveness verification.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-400/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column Text */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Next-Gen Biometric Authentication</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                Smart Face Recognition <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                  System
                </span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Secure • Fast • AI Powered Authentication
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto lg:mx-0">
                Transform workforce attendance and user access control with sub-second facial recognition, anti-spoofing liveness verification, and real-time biometric vector comparison.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => setActivePage('register')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActivePage('login')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Scan className="w-4 h-4 text-blue-500" />
                  Face Login
                </button>
              </div>

              {/* Stat Highlights */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/80">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">&lt; 1.8s</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Match Latency</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">99.4%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Recognition Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">128-D</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Vector Embeddings</div>
                </div>
              </div>
            </div>

            {/* Right Column Visual Illustration */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 border border-slate-800 shadow-2xl overflow-hidden group">
                
                {/* Laser Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                {/* Animated Scanner Laser Sweep */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-[bounce_3s_infinite]" />

                {/* Biometric Face Mesh Representation */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
                  
                  {/* Face Mesh Box */}
                  <div className="relative w-52 h-64 rounded-2xl border-2 border-cyan-400/80 bg-cyan-950/20 backdrop-blur-sm flex flex-col items-center justify-center p-4 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
                    
                    {/* Bounding Box Corner Indicators */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                    <Scan className="w-24 h-24 text-cyan-400 animate-pulse mb-3" />

                    {/* Landmark Dots Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
                      <div className="w-32 h-40 border border-cyan-500/40 rounded-full flex flex-col justify-around p-3">
                        <div className="flex justify-between px-4">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 mx-auto" />
                        <div className="w-12 h-1 bg-cyan-400/60 rounded-full mx-auto" />
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      MATCH CONFIRMED 98.72%
                    </div>
                  </div>

                  {/* Floating HUD Cards */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-xs font-mono text-slate-300 flex justify-between items-center shadow-lg">
                    <div>
                      <span className="text-slate-500 block">ENCODING VECTOR</span>
                      <span className="text-cyan-400 font-semibold">[0.421, -0.118, 0.985...]</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">LIVENESS</span>
                      <span className="text-emerald-400 font-semibold">VERIFIED ✓</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400 mb-2">
              Powerful Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Built for High-Precision Enterprise Recognition
            </h3>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
              Explore the end-to-end capabilities powering our face recognition attendance and access control architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feat.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400 mb-2">
              4-Step Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How Face Authentication Works
            </h3>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
              From account registration to instant facial recognition, our platform handles face landmark extraction effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-blue-600 dark:text-cyan-400 block mb-4">
                    {s.number}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-cyan-400">
                  <span>Step {idx + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-2xl relative overflow-hidden border border-blue-800/50">
            
            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Artificial Intelligence & Computer Vision</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Empowering Security with Computer Vision & Machine Learning
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                This Face Recognition System leverages client-side real-time video processing, facial landmark estimation, lighting quality checks, and 128-dimensional embedding calculation. Facial embeddings are compared against stored vector profiles using cosine similarity metrics for accurate, zero-spoof attendance logging.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'Face Detection', 'Secure Auth', '128-D Vectors'].map((badge, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-200"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setActivePage('register')}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Create Your Account Now
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
