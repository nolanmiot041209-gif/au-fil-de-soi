import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navLinks = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'presentation', label: 'À propos' },
  { id: 'services', label: 'Soins' },
  { id: 'galerie', label: 'Galerie' },
  { id: 'avis', label: 'Avis clients' },
  { id: 'reservation', label: 'Réservation' },
  { id: 'contact', label: 'Contact' },
];

export default function Footer() {
  const { content } = useApp();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-950 text-white/60">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <h3
                className="text-white text-2xl font-light mb-1"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Au fil de soi
              </h3>
              <span className="text-amber-400/50 text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                Head Spa Japonais
              </span>
            </div>
            <div className="w-8 h-px bg-amber-600/30 mb-4" />
            <p
              className="text-stone-500 text-sm leading-relaxed"
              style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
            >
              Votre sanctuaire de bien-être dédié aux soins du cuir chevelu japonais.
              Reconnectez-vous à vous-même, en douceur.
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              <a
                href={content.instagramUrl}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-amber-600/50 hover:text-amber-400 transition-all duration-300"
              >
                <span className="text-sm">📸</span>
              </a>
              <a
                href={content.facebookUrl}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-amber-600/50 hover:text-amber-400 transition-all duration-300"
              >
                <span className="text-sm">👤</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4
              className="text-white/80 text-xs tracking-[0.3em] uppercase mb-5"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="text-stone-500 hover:text-white transition-colors text-sm"
                    style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white/80 text-xs tracking-[0.3em] uppercase mb-5"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href={`tel:${content.phone}`}
                className="block text-stone-500 hover:text-white transition-colors text-sm"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                {content.phone}
              </a>
              <a
                href={`mailto:${content.email}`}
                className="block text-stone-500 hover:text-white transition-colors text-sm"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                {content.email}
              </a>
              <p className="text-stone-600 text-sm" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                {content.address}
              </p>
            </div>

            {/* Hours */}
            <div className="mt-6">
              <h4
                className="text-white/80 text-xs tracking-[0.3em] uppercase mb-3"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Horaires
              </h4>
              <div className="space-y-1 text-sm text-stone-500" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                <div className="flex justify-between">
                  <span>Lun — Sam</span>
                  <span>9h00 — 19h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="text-stone-700">Fermé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/5 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-stone-700 text-xs"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            © {new Date().getFullYear()} Au fil de soi. Tous droits réservés.
          </p>
          <p
            className="text-stone-700 text-xs flex items-center gap-1"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Créé avec <Heart size={10} className="text-amber-700/50" fill="currentColor" /> pour votre bien-être
          </p>
        </div>
      </div>
    </footer>
  );
}
