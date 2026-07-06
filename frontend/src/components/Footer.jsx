import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin, Heart } from 'lucide-react';

/**
 * Premium structured Footer component.
 * Includes logo brand space, links grid, and standard copyright statement.
 */
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                SkillSwap<span className="text-indigo-400">.</span>AI
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Empowering students to share skills, learn collaboratively, build portfolios, and establish their authority through peer-to-peer mentoring.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-indigo-400 transition-colors p-2 bg-slate-800 rounded-lg hover:scale-105" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-indigo-400 transition-colors p-2 bg-slate-800 rounded-lg hover:scale-105" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-indigo-400 transition-colors p-2 bg-slate-800 rounded-lg hover:scale-105" aria-label="Github">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-white font-semibold font-display mb-6 tracking-wide uppercase text-xs">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
            </ul>
          </div>

          {/* Legal / Resources Column */}
          <div>
            <h3 className="text-white font-semibold font-display mb-6 tracking-wide uppercase text-xs">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">FAQ & Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Slogan & Info / Mock newsletter Column */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold font-display mb-2 tracking-wide uppercase text-xs">Stay Updated</h3>
            <p className="text-sm">Subscribe to receive announcements, new features and peer matches.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500" 
              />
              <button className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg text-xs font-semibold transition-all">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-800/80 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; {new Date().getFullYear()} SkillSwap AI. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            Crafted with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> by developers for students.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
