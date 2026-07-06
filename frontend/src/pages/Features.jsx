import React from 'react';
import { Sparkles, Brain, Clock, ShieldCheck, Video, FileEdit, GraduationCap, Laptop, Share2, Award } from 'lucide-react';
import FeatureCard from '@components/FeatureCard.jsx';

/**
 * Dedicated Features Page detailing current and upcoming platform features.
 */
const Features = () => {
  const coreFeatures = [
    {
      title: 'Peer Matching Engine',
      description: 'Filter and discover student mentors matching the precise subject areas you are interested in.',
      icon: GraduationCap,
    },
    {
      title: 'Responsive Session Dashboard',
      description: 'Manage active requests, review upcoming teaching appointments, and follow study schedules.',
      icon: Laptop,
    },
    {
      title: 'Skill Portfolio Pages',
      description: 'Display your academic achievements, projects, rating history, and active skills you teach.',
      icon: Award,
    },
    {
      title: 'Collaborative Notes Share',
      description: 'Exchange links, slides, reference materials, and study questions within your matching page.',
      icon: Share2,
    }
  ];

  const upcomingFeatures = [
    {
      title: 'AI Smart Matching',
      description: 'Machine learning algorithms matching students based on learning styles, schedules, and past rating history.',
      icon: Sparkles,
      badge: 'Phase 2'
    },
    {
      title: 'AI Session Summarizer',
      description: 'Generates structured transcripts, explanations, code blocks, and follow-up homework automatically.',
      icon: Brain,
      badge: 'Phase 2'
    },
    {
      title: 'In-App Video & Classroom',
      description: 'Integrated audio, video calls, shared canvas/drawing board, and code editors for distraction-free teaching.',
      icon: Video,
      badge: 'Phase 3'
    },
    {
      title: 'Reputation Verification',
      description: 'Verification checkmarks for students who consistently achieve top ratings or complete subject tests.',
      icon: ShieldCheck,
      badge: 'Phase 3'
    }
  ];

  return (
    <div className="py-16 md:py-24 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 theme-transition">
      
      {/* Header section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/50 transition-colors duration-300">
          Features
        </span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 dark:text-white tracking-tight mt-3 transition-colors duration-300">
          Designed for Premium Collaborative Learning
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed transition-colors duration-300">
          From finding perfect study matches to conducting live video study sessions, SkillSwap AI provides all the tools required for peer education.
        </p>
      </section>

      {/* Core Features */}
      <section className="space-y-10">
        <div className="border-l-4 border-indigo-600 dark:border-indigo-500 pl-4">
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white transition-colors duration-300">
            Core Foundation (Phase 1)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">Available today to start collaborating.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coreFeatures.map((feat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mb-6 transition-colors duration-300">
                <feat.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 transition-colors duration-300">{feat.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Roadmap */}
      <section className="space-y-10 bg-slate-100/50 dark:bg-slate-900/30 py-16 px-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
        <div className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white transition-colors duration-300">
            Roadmap (Phases 2 & 3)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">Next-gen intelligence and features we are developing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {upcomingFeatures.map((feat, idx) => (
            <FeatureCard 
              key={idx}
              title={feat.title}
              description={feat.description}
              icon={feat.icon}
              badge={feat.badge}
            />
          ))}
        </div>
      </section>

    </div>
  );
};

export default Features;
