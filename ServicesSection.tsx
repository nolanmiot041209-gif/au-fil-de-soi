import { useEffect, useRef } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServicesSection() {
  const { SERVICES } = useApp();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.service-card');
            cards.forEach((card, i) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0)';
              }, i * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" className="py-24 md:py-32 bg-stone-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="text-amber-400/60 text-xs tracking-[0.4em] uppercase mb-4 block"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Nos soins
          </span>
          <h2
            className="text-4xl md:text-5xl font-light text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            L'art du soin du cuir chevelu
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-12 bg-amber-500/30" />
            <div className="w-2 h-2 rounded-full bg-amber-500/30" />
            <div className="h-px w-12 bg-amber-500/30" />
          </div>
          <p
            className="text-stone-400 text-base mt-6 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
          >
            Chaque soin est une cérémonie pensée pour votre bien-être. Choisissez l'expérience qui vous correspond.
          </p>
        </div>

        {/* Services grid */}
        <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((service, i) => (
            <div
              key={service.id}
              className="service-card group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 cursor-pointer"
              style={{
                opacity: 0,
                transform: 'translateY(30px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease, background 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {/* Number */}
              <div className="absolute top-6 right-6 text-5xl font-light text-white/5 select-none pointer-events-none"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className="p-8">
                {/* Service name */}
                <h3
                  className="text-2xl font-light text-white mb-3 group-hover:text-amber-300 transition-colors duration-300"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {service.name}
                </h3>

                {/* Duration & price */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-stone-400 text-sm">
                    <Clock size={14} />
                    <span style={{ fontFamily: "'Jost', sans-serif" }}>{service.duration} min</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <span
                    className="text-amber-400 font-light text-xl"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {service.price}
                  </span>
                </div>

                <div className="w-8 h-px bg-amber-600/30 group-hover:w-16 transition-all duration-500 mb-4" />

                <p
                  className="text-stone-400 text-sm leading-relaxed mb-6"
                  style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
                >
                  {service.description}
                </p>

                {/* CTA */}
                <button
                  onClick={() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 text-amber-400/70 hover:text-amber-300 text-sm transition-colors duration-300 group/btn"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  <span>Réserver ce soin</span>
                  <ArrowRight size={14} className="transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Bottom accent */}
              <div className="h-px bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-stone-500 text-sm mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Vous souhaitez un soin personnalisé ?
          </p>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-luxury px-8 py-3 border border-amber-600/30 text-amber-400/80 hover:text-amber-300 hover:border-amber-500/50 rounded-full text-sm tracking-wide transition-all duration-300"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Nous contacter
          </button>
        </div>
      </div>
    </section>
  );
}
