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
import MyFeedback from '@pages/MyFeedback.jsx';
import MyReports from '@pages/MyReports.jsx';
import NotFound from '@pages/NotFound.jsx';

// Admin imports
import AdminLayout from '@pages/admin/AdminLayout.jsx';
import AdminDashboard from '@pages/admin/AdminDashboard.jsx';
import AdminUsers from '@pages/admin/AdminUsers.jsx';
import AdminFeedback from '@pages/admin/AdminFeedback.jsx';
import AdminReports from '@pages/admin/AdminReports.jsx';
import AdminAnalytics from '@pages/admin/AdminAnalytics.jsx';
import AdminSettings from '@pages/admin/AdminSettings.jsx';

// Feedback components imports
import FloatingFeedbackButton from '@components/FloatingFeedbackButton.jsx';
import FeedbackModal from '@components/FeedbackModal.jsx';
import ReportModal from '@components/ReportModal.jsx';

function AppContent() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white theme-transition">
      {/* Sticky Header Navigation (Hidden on Admin pages to preserve SaaS sidebar space) */}
      {!isAdminPage && <Navbar />}
      
      {/* Page Content area */}
      <main className={`flex-grow ${isAdminPage ? 'pt-0' : 'pt-16'}`}>
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
          <Route path="/feedback/my" element={<MyFeedback />} />
          <Route path="/reports/my" element={<MyReports />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Global Footer (Hidden on Chat and Admin pages) */}
      {!isChatPage && !isAdminPage && <Footer />}

      {/* Floating feedback action triggers */}
      <FloatingFeedbackButton />
      <FeedbackModal />
      <ReportModal />
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
