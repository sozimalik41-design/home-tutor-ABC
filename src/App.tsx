import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { FindTutorsPage } from './pages/FindTutorsPage';
import { TutorDetailsPage } from './pages/TutorDetailsPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { PostersPage } from './pages/PostersPage';
import { VideosPage } from './pages/VideosPage';
import { GalleryPage } from './pages/GalleryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TutorDashboardPage } from './pages/TutorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Chatbot } from './components/chat/Chatbot';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 relative">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/tutors" element={<FindTutorsPage />} />
            <Route path="/tutors/:id" element={<TutorDetailsPage />} />
            <Route path="/book-appointment" element={<BookAppointmentPage />} />
            <Route path="/posters" element={<PostersPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Visual Dashboards & Admin Shortcuts */}
            <Route path="/dashboard/tutor" element={<TutorDashboardPage />} />
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/admissions" element={<Navigate to="/dashboard/admin?tab=admissions" replace />} />
            <Route path="/inbox" element={<Navigate to="/dashboard/admin?tab=inbox" replace />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Home Tutor AI Floating Assistant */}
        <Chatbot />
      </div>
    </BrowserRouter>
  );
}
