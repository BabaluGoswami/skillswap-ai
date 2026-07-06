import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '@components/Navbar.jsx';
import Footer from '@components/Footer.jsx';

// Pages imports
import Home from '@pages/Home.jsx';
import About from '@pages/About.jsx';
import Features from '@pages/Features.jsx';
import Login from '@pages/Login.jsx';
import Register from '@pages/Register.jsx';
import Dashboard from '@pages/Dashboard.jsx';
import Profile from '@pages/Profile.jsx';
import IncomingRequests from '@pages/IncomingRequests.jsx';
import SentRequests from '@pages/SentRequests.jsx';
import Chat from '@pages/Chat.jsx';
import NotFound from '@pages/NotFound.jsx';

function AppContent() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white theme-transition">
      {/* Sticky Header Navigation */}
      <Navbar />
      
      {/* Page Content area */}
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/swaps/incoming" element={<IncomingRequests />} />
          <Route path="/swaps/sent" element={<SentRequests />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Global Footer (Hidden on Chat page) */}
      {!isChatPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
