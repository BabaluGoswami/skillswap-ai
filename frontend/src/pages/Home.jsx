import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import { 
  Users, BookOpen, Calendar, Award, 
  UserPlus, Award as AddSkillIcon, Search, HeartHandshake,
  Sparkles, Brain, Clock, ShieldCheck, Video, FileEdit,
  ArrowRight
} from 'lucide-react';

// Component Imports
import FeatureCard from '@components/FeatureCard.jsx';
import StatisticCard from '@components/StatisticCard.jsx';
import TestimonialCard from '@components/TestimonialCard.jsx';
import FAQItem from '@components/FAQItem.jsx';

/**
 * SkillSwap AI Main Landing Page.
 * Implements modern web styling, soft grids, and visual premium components with dark mode support.
 */
const Home = () => {
  const { getPlatformStatistics } = useApp();
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalSkills: 0,
    totalSwapRequests: 0,
    completedSessions: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      const res = await getPlatformStatistics();
      if (res.success) {
        setStats(res.stats);
      }
    };
    fetchStats();
  }, []);

  // Statistics Data
  const statsList = [
    { label: 'Students Learning', value: stats.totalUsers, icon: Users },
    { label: 'Skills Exchangeable', value: stats.totalSkills, icon: BookOpen },
    { label: 'Sessions Completed', value: stats.completedSessions, icon: Calendar },
    { label: 'Swap Requests', value: stats.totalSwapRequests, icon: Award }
  ];

  // How it works steps
  const stepsList = [
    {
      title: 'Create Profile',
      description: 'Sign up and showcase your academic background, achievements, and teaching interests.',
      icon: UserPlus,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60'
    },
    {
      title: 'Add Skills',
      description: 'List the subjects or skills you can teach, along with the ones you want to learn.',
      icon: AddSkillIcon,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60'
    },
    {
      title: 'Find Matches',
      description: 'Find matching peers who possess the skills you need and are looking to learn yours.',
      icon: Search,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60'
    },
    {
      title: 'Learn Together',
      description: 'Schedule a session, connect in our virtual classroom, and exchange knowledge.',
      icon: HeartHandshake,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60'
    }
  ];

  // Features list
  const featuresList = [
    {
      title: 'AI Matching',
      description: 'Our intelligent matching algorithm aligns your learning requirements with the best possible mentors.',
      icon: Sparkles,
      badge: 'Upcoming'
    },
    {
      title: 'Smart Recommendations',
      description: 'Get automated suggestions for subjects, topics, or study plans based on your learning history.',
      icon: Brain,
      badge: 'Upcoming'
    },
    {
      title: 'Session Requests',
      description: 'Request learning or teaching sessions with custom timings, notes, and study resources easily.',
      icon: Clock,
      badge: 'Upcoming'
    },
    {
      title: 'Ratings & Reputation',
      description: 'Build your credibility within the community as a helpful student mentor by earning stars and badges.',
      icon: ShieldCheck,
      badge: 'Upcoming'
    },
    {
      title: 'Screen Sharing',
      description: 'Teach more effectively by sharing presentations, code editors, or drawing boards directly in-app.',
      icon: Video,
      badge: 'Upcoming'
    },
    {
      title: 'AI Session Summary',
      description: 'Never worry about taking notes. Get automated, structured summaries and action plans after every session.',
      icon: FileEdit,
      badge: 'Upcoming'
    }
  ];

  // Why Students Love SkillSwap AI list
  const reasonsList = [
    {
      title: 'Learn by Teaching',
      description: 'Teaching others reinforces your own understanding while helping fellow students grow together.',
      icon: HeartHandshake
    },
    {
      title: 'Skill-Based Collaboration',
      description: 'Connect with students who can teach the skills you want to learn and discover learners interested in your expertise.',
      icon: Users
    },
    {
      title: 'Build Your Learning Network',
      description: 'Expand your academic network through meaningful collaborations, skill exchanges, and real-time conversations.',
      icon: Sparkles
    }
  ];

  // FAQ list
  const faqList = [
    {
      question: 'What is SkillSwap AI?',
      answer: 'SkillSwap AI is a collaborative platform designed for students to teach each other different skills. You teach a subject you excel in, and learn a subject you want to improve, entirely free.'
    },
    {
      question: 'Is SkillSwap AI free to use?',
      answer: 'Yes! The core philosophy of SkillSwap AI is reciprocal learning. You share your knowledge to receive knowledge in return, with no monetary costs involved.'
    },
    {
      question: 'How do learning sessions work?',
      answer: 'Once you find a suitable match, you can request a session. When accepted, both students connect via our upcoming video and screen sharing tools to teach and learn together.'
    },
    {
      question: 'What skills can I teach or learn?',
      answer: 'Any skill! From programming languages (Python, React) and academic courses (Calculus, Physics) to design, public speaking, music, or foreign languages.'
    }
  ];

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden theme-transition">
      
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 bg-grid-pattern">
        {/* Glow Spheres */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-950/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-950/10 rounded-full blur-3xl -z-10 animate-float" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-full px-4.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors duration-300">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Peer-to-Peer Learning
          </div>
          
          <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto transition-colors duration-300">
            Learn Smarter. <span className="bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">Teach Better.</span> Grow Together.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            SkillSwap AI connects students worldwide to exchange knowledge. Teach what you excel at, acquire new skills, build your credibility, and learn for free.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 px-8 py-4 rounded-full shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-xl transition-all group"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/features"
              className="w-full sm:w-auto flex items-center justify-center font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 rounded-full transition-colors duration-300"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsList.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl transition-colors duration-300">
              <StatisticCard 
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="bg-slate-100/50 dark:bg-slate-950/20 py-20 border-y border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white transition-colors duration-300">
              How SkillSwap AI Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">
              Starting your peer-learning journey is simple. Follow these four simple phases.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stepsList.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-slate-800/80 relative group transition-colors duration-300">
                  {/* Step counter */}
                  <span className="absolute -top-4 left-6 bg-indigo-600 dark:bg-indigo-500 text-white font-bold font-display text-xs px-3 py-1 rounded-full shadow-md shadow-indigo-100 dark:shadow-none transition-colors duration-300">
                    Step 0{index + 1}
                  </span>
                  
                  <div className={`p-4 rounded-2xl border ${step.color} mb-6 mt-2 group-hover:scale-110 transition-all duration-300`}>
                    <StepIcon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/50 transition-colors duration-300">
            Roadmap
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white mt-2 transition-colors duration-300">
            Powerful Upcoming Features
          </h2>
          <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">
            We are continuously building to improve our community. Check out what is dropping in Phase 2.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-3xl transition-colors duration-300">
              <FeatureCard 
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                badge={feature.badge}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Why Students Love SkillSwap AI */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 border border-transparent dark:border-slate-800">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-float" />
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 relative z-10">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
            Why Students Love SkillSwap AI
          </h2>
          <p className="text-slate-400">
            Discover how SkillSwap AI helps students learn faster through peer-to-peer knowledge sharing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {reasonsList.map((reason, index) => (
            <div key={index} className="text-slate-800">
              <FeatureCard 
                title={reason.title}
                description={reason.description}
                icon={reason.icon}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white transition-colors duration-300">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">
            Need help? Here are answers to common questions about SkillSwap AI.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqList.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl transition-colors duration-300">
              <FAQItem 
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 7. Call To Action (CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 dark:from-indigo-950 dark:to-blue-900 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-xl shadow-indigo-100 dark:shadow-none transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10" />
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-white/10 rounded-full blur-2xl animate-float" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-white/10 rounded-full blur-2xl animate-pulse-slow" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl leading-tight">
              Ready to Upgrade Your Skills?
            </h2>
            <p className="text-indigo-100 dark:text-slate-300 text-base md:text-lg transition-colors duration-300">
              Join the student learning network. Match with peer mentors, share your knowledge, and track your achievements.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto font-bold bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-full shadow-md transition-all flex items-center justify-center gap-2"
              >
                Sign Up Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                to="/about" 
                className="w-full sm:w-auto font-semibold bg-indigo-500/30 dark:bg-indigo-950/40 text-white hover:bg-indigo-500/40 border border-indigo-400/30 px-8 py-4 rounded-full transition-colors flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
