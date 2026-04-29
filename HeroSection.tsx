import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HeroSection() {
  const { content } = useApp();
  const textRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textRef.current) {
        textRef.current.style.opacity = '1';
        textRef.current.style.transform = 'translateY(0)';
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const scrollToPresentation = () => {
    document.getElementById('presentation')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="accueil" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Au fil de soi - Head Spa"
          className="w-full h-full object-cover object-center"
          style={{ transform: 'scale(1.05)' }}
        />
      </div>

      {/* Overlay */}
      <div className="hero-overlay absolute inset-0" />

      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-200/30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        ref={textRef}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        style={{
          opacity: 0,
          transform: 'translateY(30px)',
          transition: 'opacity 1.2s ease, transform 1.2s ease',
        }}
      >
        {/* Subtitle line above */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-12 bg-amber-300/50" />
          <span
            className="text-amber-200/80 text-xs tracking-[0.4em] uppercase"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Head Spa Japonais
          </span>
          <div className="h-px w-12 bg-amber-300/50" />
        </div>

        {/* Main title */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6 leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {content.heroTitle}
        </h1>

        {/* Decorative line */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
        </div>

        {/* Subtitle */}
        <p
          className="text-white/75 text-base md:text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {content.heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToReservation}
            className="btn-luxury px-8 py-4 bg-amber-700/90 hover:bg-amber-700 text-white rounded-full text-sm tracking-widest uppercase transition-all duration-400 hover:shadow-lg hover:shadow-amber-900/30 hover:-translate-y-0.5"
            style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.15em' }}
          >
            {content.heroButton}
          </button>
          <button
            onClick={scrollToPresentation}
            className="btn-luxury px-8 py-4 border border-white/30 text-white/80 hover:text-white hover:border-white/60 rounded-full text-sm tracking-widest uppercase transition-all duration-400 hover:-translate-y-0.5"
            style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.15em' }}
          >
            Découvrir
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToPresentation}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 transition-colors duration-300"
        style={{ animation: 'float 2s ease-in-out infinite' }}
      >
        <ChevronDown size={24} />
      </button>

      {/* Corner decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50/20 to-transparent pointer-events-none" />
    </section>
  );
}
