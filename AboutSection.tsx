import { useEffect, useRef, useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const values = [
  {
    icon: '🌿',
    title: 'Détente',
    desc: 'Un espace pensé pour vous déconnecter du quotidien et retrouver un calme profond.',
  },
  {
    icon: '✨',
    title: 'Soin',
    desc: 'Des rituels japonais authentiques, des produits d\'exception pour sublimer votre cuir chevelu.',
  },
  {
    icon: '🪷',
    title: 'Reconnexion',
    desc: 'Chaque séance est une invitation à revenir à vous-même, en douceur et en conscience.',
  },
];

export default function AboutSection() {
  const { content, setContent, isAdminLoggedIn } = useApp();
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(content.aboutTitle);
  const [draftText, setDraftText] = useState(content.aboutText);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    if (textRef.current) observer.observe(textRef.current);

    return () => observer.disconnect();
  }, []);

  const saveEdits = () => {
    setContent({ aboutTitle: draftTitle, aboutText: draftText });
    setEditing(false);
  };

  const cancelEdits = () => {
    setDraftTitle(content.aboutTitle);
    setDraftText(content.aboutText);
    setEditing(false);
  };

  return (
    <section id="presentation" className="py-24 md:py-32 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal" ref={sectionRef}>
          <span
            className="text-amber-700/60 text-xs tracking-[0.4em] uppercase mb-4 block"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Notre histoire
          </span>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-px w-12 bg-amber-300/50" />
            <div className="w-2 h-2 rounded-full bg-amber-300/50" />
            <div className="h-px w-12 bg-amber-300/50" />
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image side */}
          <div ref={imgRef} className="reveal-left">
            <div className="relative">
              {/* Main image */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-stone-300/50">
                <img
                  src="/images/about-img.jpg"
                  alt="Soin head spa"
                  className="w-full h-[500px] object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent" />
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-5 shadow-xl border border-amber-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg">
                    🌸
                  </div>
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Expérience
                    </div>
                    <div className="text-stone-800 font-medium text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Rituels japonais
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border border-amber-200/50 rounded-full" />
              <div className="absolute -top-2 -left-2 w-12 h-12 border border-amber-200/30 rounded-full" />
            </div>
          </div>

          {/* Text side */}
          <div ref={textRef} className="reveal-right">
            {editing ? (
              <div className="space-y-4">
                <input
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  className="w-full text-3xl border-b border-amber-200 bg-transparent pb-2 text-stone-800 focus:outline-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                />
                <textarea
                  value={draftText}
                  onChange={e => setDraftText(e.target.value)}
                  rows={10}
                  className="w-full text-stone-600 text-sm leading-relaxed border border-amber-200 rounded-lg p-4 bg-white resize-none focus:outline-none"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={saveEdits}
                    className="flex items-center gap-2 px-5 py-2 bg-amber-700 text-white rounded-full text-sm hover:bg-amber-800 transition-colors"
                  >
                    <Check size={14} /> Sauvegarder
                  </button>
                  <button
                    onClick={cancelEdits}
                    className="flex items-center gap-2 px-5 py-2 border border-stone-200 text-stone-600 rounded-full text-sm hover:bg-stone-50 transition-colors"
                  >
                    <X size={14} /> Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {content.aboutTitle}
                  </h2>
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => setEditing(true)}
                      className="ml-4 p-2 text-amber-700/50 hover:text-amber-700 transition-colors rounded-full hover:bg-amber-50"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>

                <div className="w-10 h-px bg-amber-300 mb-8" />

                {content.aboutText.split('\n\n').map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-stone-600 text-base leading-relaxed mb-4"
                    style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
                  >
                    {paragraph}
                  </p>
                ))}

                <button
                  onClick={() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-6 btn-luxury inline-flex items-center gap-2 px-7 py-3 bg-stone-800 text-white rounded-full text-sm tracking-wide hover:bg-amber-800 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Réserver un soin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {values.map((val, i) => (
            <div
              key={i}
              className="reveal text-center p-8 rounded-2xl bg-white border border-amber-100/60 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-400 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl mb-4 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                {val.icon}
              </div>
              <h3
                className="text-xl font-light text-stone-800 mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {val.title}
              </h3>
              <div className="w-8 h-px bg-amber-300 mx-auto mb-4" />
              <p
                className="text-stone-500 text-sm leading-relaxed"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
