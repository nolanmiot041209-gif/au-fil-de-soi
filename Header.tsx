import { useState, useRef, useEffect } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onAdminClick: () => void;
  currentSection: string;
}

const navLinks = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'presentation', label: 'À propos' },
  { id: 'services', label: 'Soins' },
  { id: 'galerie', label: 'Galerie' },
  { id: 'avis', label: 'Avis' },
  { id: 'reservation', label: 'Réservation' },
  { id: 'contact', label: 'Contact' },
];

export default function Header({ onAdminClick, currentSection }: HeaderProps) {
  const { content, setContent, isAdminLoggedIn, logoutAdmin } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setContent({ logoSrc: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setContent({ logoSrc: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMenuOpen(false);
    }
  };

  const isActive = (id: string) => currentSection === id;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-sm border-b border-amber-100/50 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div
            className={`relative cursor-pointer group ${dragOver ? 'drop-zone drag-over rounded-lg p-2' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleLogoDrop}
            onClick={() => isAdminLoggedIn && fileInputRef.current?.click()}
          >
            {content.logoSrc ? (
              <img
                src={content.logoSrc}
                alt={content.logoAlt}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-start">
                <span
                  className={`font-serif text-2xl font-light tracking-wide transition-colors duration-300 ${
                    scrolled ? 'text-stone-800' : 'text-white'
                  }`}
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Au fil de soi
                </span>
                <span
                  className={`text-xs tracking-[0.2em] uppercase font-light transition-colors duration-300 ${
                    scrolled ? 'text-amber-700/70' : 'text-amber-200/80'
                  }`}
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Head Spa
                </span>
              </div>
            )}
            {isAdminLoggedIn && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-xs font-light">Changer logo</span>
              </div>
            )}
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-amber-700 text-xs">Déposer ici</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoFile}
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`nav-link text-sm tracking-wide transition-colors duration-300 ${
                  scrolled
                    ? isActive(link.id)
                      ? 'text-amber-700'
                      : 'text-stone-600 hover:text-stone-900'
                    : isActive(link.id)
                    ? 'text-amber-300'
                    : 'text-white/80 hover:text-white'
                }`}
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400 }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Book button */}
            <button
              onClick={() => scrollTo('reservation')}
              className={`hidden md:flex btn-luxury items-center gap-2 px-5 py-2 text-sm rounded-full transition-all duration-300 ${
                scrolled
                  ? 'bg-stone-800 text-white hover:bg-amber-800'
                  : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
              }`}
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Réserver
            </button>

            {/* Admin button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onAdminClick}
                  className={`p-2 rounded-full transition-colors ${
                    scrolled ? 'text-stone-600 hover:text-amber-700' : 'text-white/80 hover:text-white'
                  }`}
                  title="Panel admin"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={logoutAdmin}
                  className={`p-2 rounded-full transition-colors ${
                    scrolled ? 'text-stone-600 hover:text-red-600' : 'text-white/80 hover:text-white'
                  }`}
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdminClick}
                className={`p-2 rounded-full transition-colors ${
                  scrolled ? 'text-stone-400 hover:text-stone-700' : 'text-white/50 hover:text-white/80'
                }`}
                title="Admin"
              >
                <Settings size={16} />
              </button>
            )}

            {/* Hamburger */}
            <button
              className={`lg:hidden p-2 rounded-full transition-colors ${
                scrolled ? 'text-stone-700' : 'text-white'
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <div className={`hamburger ${menuOpen ? 'open' : ''} flex flex-col gap-[6px]`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-stone-950/80 modal-backdrop"
          onClick={() => setMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-stone-950 transform transition-transform duration-500 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-8 pt-20">
            <div className="mb-8">
              <span className="text-amber-200/50 text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                Navigation
              </span>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-left py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-lg"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    animationDelay: `${i * 0.05}s`
                  }}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-white/10">
              <button
                onClick={() => { scrollTo('reservation'); setMenuOpen(false); }}
                className="w-full py-3 bg-amber-700 text-white rounded-full text-sm font-medium hover:bg-amber-800 transition-colors btn-luxury"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Prendre rendez-vous
              </button>
            </div>

            <div className="mt-4">
              {isAdminLoggedIn ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onAdminClick(); setMenuOpen(false); }}
                    className="flex-1 py-2 border border-white/20 text-white/60 rounded-full text-xs hover:border-amber-700/50 hover:text-amber-300 transition-colors"
                  >
                    Panel admin
                  </button>
                  <button
                    onClick={() => { logoutAdmin(); setMenuOpen(false); }}
                    className="py-2 px-3 border border-red-900/30 text-red-400/60 rounded-full text-xs hover:text-red-400 transition-colors"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { onAdminClick(); setMenuOpen(false); }}
                  className="w-full py-2 border border-white/10 text-white/30 rounded-full text-xs hover:text-white/60 transition-colors"
                >
                  Connexion admin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
