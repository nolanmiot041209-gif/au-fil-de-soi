import { useState, useEffect, useRef } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import GallerySection from './components/GallerySection';
import VideoSection from './components/VideoSection';
import ReviewsSection from './components/ReviewsSection';
import BookingSection from './components/BookingSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import { useApp } from './context/AppContext';

function AppContent() {
  const { isAdminLoggedIn } = useApp();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentSection, setCurrentSection] = useState('accueil');

  // Intersection observer for current section tracking
  useEffect(() => {
    const sections = ['accueil', 'presentation', 'services', 'galerie', 'video', 'avis', 'reservation', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -20% 0px' }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Intersection observer for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      setShowAdminPanel(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowAdminLogin(false);
    setShowAdminPanel(true);
  };

  return (
    <div className="min-h-screen">
      {/* Fixed admin indicator */}
      {isAdminLoggedIn && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 mt-16 pointer-events-none">
          <div className="bg-amber-700/90 text-white text-xs px-4 py-1 rounded-full shadow-lg"
            style={{ fontFamily: "'Jost', sans-serif" }}>
            🔧 Mode administrateur actif
          </div>
        </div>
      )}

      <Header onAdminClick={handleAdminClick} currentSection={currentSection} />

      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <GallerySection />
        <VideoSection />
        <ReviewsSection />
        <BookingSection />
        <ContactSection />
      </main>

      <Footer />

      {/* Admin Login Modal */}
      {showAdminLogin && !isAdminLoggedIn && (
        <AdminLogin
          onClose={() => setShowAdminLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Admin Panel */}
      {showAdminPanel && isAdminLoggedIn && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
