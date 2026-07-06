import React from 'react';
import { Target, Users, BookOpen, Compass } from 'lucide-react';

/**
 * High-quality About Page detailing company values, mission and target user experience.
 */
const About = () => {
  const values = [
    {
      title: 'Reciprocal Growth',
      description: 'We believe knowledge exchange should be mutually beneficial. Teaching is one of the best ways to reinforce your own learning.',
      icon: Target,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Peer Collaboration',
      description: 'Connecting students allows for relaxed, relatable, and tailored learning environments that conventional classrooms lack.',
      icon: Users,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Accessibility',
      description: 'High-quality learning support should not be restricted by financial limits. Education is free when students cooperate.',
      icon: BookOpen,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'AI Assisted Learning',
      description: 'Using intelligence to group profiles, recommend resources, and summarize study sessions to save time.',
      icon: Compass,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
    }
  ];

  return (
    <div className="py-16 md:py-24 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 theme-transition">
      
      {/* Header section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-indigo-600 dark:text-indigo-455 font-bold uppercase tracking-wider text-xs bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/60 transition-colors duration-300">
          Our Vision
        </span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 dark:text-white tracking-tight mt-3 transition-colors duration-300">
          Democratizing Student Education Through Collaboration
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed transition-colors duration-300">
          SkillSwap AI was created with a simple idea: every student is a master at something and a student of something else. By connecting peers, we make personalized tutoring accessible to everyone.
        </p>
      </section>

      {/* Grid of Values */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white mb-4 transition-colors duration-300">
            Our Core Values
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
            What guides our community, product, and platform choices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                <div className={`p-4 w-fit rounded-2xl ${val.color} mb-6 transition-colors duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-3 transition-colors duration-300">{val.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mission details section */}
      <section className="bg-gradient-to-br from-indigo-50/40 to-blue-50/40 dark:from-indigo-950/10 dark:to-blue-950/10 rounded-3xl p-8 md:p-12 border border-indigo-50/60 dark:border-slate-800/60 theme-transition">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white leading-tight transition-colors duration-300">
              Learning is better when we teach each other.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm transition-colors duration-300">
              Studies show that the absolute best way to master a complex topic is to teach it to someone else. SkillSwap AI leverages this cognitive learning approach. When you explain programming loops or historical events to a peer, you develop a much deeper connection to the material.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm transition-colors duration-300">
              At the same time, receiving instruction from a peer who recently mastered the subject feels less intimidating and more relatable than formal academic lectures.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-all duration-300">
            <div className="border-l-4 border-indigo-600 dark:border-indigo-500 pl-4">
              <p className="italic text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors duration-300">
                "SkillSwap AI is not just a platform; it is a movement to build an educational community where every student has a personal coach."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-display font-bold text-indigo-700 dark:text-indigo-300 transition-colors duration-300">
                SS
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white transition-colors duration-300">SkillSwap Leadership</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 transition-colors duration-300">Student Empowerment Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
