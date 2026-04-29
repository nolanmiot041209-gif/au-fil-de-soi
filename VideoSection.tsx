import { useRef, useState } from 'react';
import { Upload, Play, X, Link, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VideoSection() {
  const { content, setContent, isAdminLoggedIn } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState(content.videoEmbed);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setContent({ videoSrc: url, videoEmbed: '' });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setContent({ videoSrc: url, videoEmbed: '' });
    }
    e.target.value = '';
  };

  const saveEmbedUrl = () => {
    setContent({ videoEmbed: urlInput, videoSrc: null });
    setShowUrlModal(false);
  };

  const getEmbedUrl = (url: string) => {
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

    return url;
  };

  const hasContent = content.videoSrc || content.videoEmbed;

  return (
    <section id="video" className="py-24 md:py-32 bg-stone-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="text-amber-700/60 text-xs tracking-[0.4em] uppercase mb-4 block"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            En images
          </span>
          <h2
            className="text-4xl md:text-5xl font-light text-stone-800 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Vivez l'expérience
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-12 bg-amber-300/50" />
            <div className="w-2 h-2 rounded-full bg-amber-300/50" />
            <div className="h-px w-12 bg-amber-300/50" />
          </div>
        </div>

        {/* Video container */}
        <div className="relative">
          {hasContent ? (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-stone-300/30 aspect-video bg-black">
              {content.videoEmbed ? (
                playing ? (
                  <iframe
                    src={getEmbedUrl(content.videoEmbed)}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div
                    className="relative w-full h-full flex items-center justify-center cursor-pointer group bg-stone-900"
                    onClick={() => setPlaying(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-800/50 to-stone-900/80" />
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 mx-auto mb-4">
                        <Play size={28} className="text-white ml-1" fill="white" />
                      </div>
                      <p className="text-white/60 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
                        Cliquez pour lire
                      </p>
                    </div>
                  </div>
                )
              ) : content.videoSrc ? (
                <video
                  ref={videoRef}
                  src={content.videoSrc}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : null}

              {/* Admin overlay */}
              {isAdminLoggedIn && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    onClick={() => setShowUrlModal(true)}
                    className="px-3 py-1.5 bg-black/60 text-white text-xs rounded-lg hover:bg-black/80 transition-colors flex items-center gap-1"
                  >
                    <Link size={12} /> Changer le lien
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-black/60 text-white text-xs rounded-lg hover:bg-black/80 transition-colors flex items-center gap-1"
                  >
                    <Upload size={12} /> Changer la vidéo
                  </button>
                  <button
                    onClick={() => setContent({ videoSrc: null, videoEmbed: '' })}
                    className="px-3 py-1.5 bg-red-600/60 text-white text-xs rounded-lg hover:bg-red-600/80 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`drop-zone rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                dragOver ? 'drag-over bg-amber-50' : 'bg-stone-100'
              }`}
              onDragOver={(e) => { e.preventDefault(); if (isAdminLoggedIn) setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={isAdminLoggedIn ? handleDrop : undefined}
              onClick={() => isAdminLoggedIn && fileInputRef.current?.click()}
            >
              {isAdminLoggedIn ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <Play size={28} className="text-amber-700/60 ml-1" />
                  </div>
                  <p className="text-stone-700 font-medium mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Ajoutez une vidéo de présentation
                  </p>
                  <p className="text-stone-400 text-sm mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Glissez un fichier ou cliquez pour sélectionner
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowUrlModal(true); }}
                    className="flex items-center gap-2 px-5 py-2 border border-amber-300 text-amber-700 rounded-full text-sm hover:bg-amber-50 transition-colors"
                  >
                    <Link size={14} /> Utiliser un lien YouTube/Vimeo
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center mb-4">
                    <Play size={28} className="text-stone-400 ml-1" />
                  </div>
                  <p className="text-stone-400" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Vidéo de présentation bientôt disponible
                  </p>
                </>
              )}
            </div>
          )}

          {isAdminLoggedIn && !hasContent && (
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileInput}
            />
          )}
        </div>
      </div>

      {/* URL Modal */}
      {showUrlModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 modal-backdrop flex items-center justify-center p-4"
          onClick={() => setShowUrlModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3
              className="text-xl font-light text-stone-800 mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Lien vidéo
            </h3>
            <p className="text-stone-400 text-sm mb-6" style={{ fontFamily: "'Jost', sans-serif" }}>
              YouTube, Vimeo ou URL directe
            </p>
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none"
              style={{ fontFamily: "'Jost', sans-serif" }}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEmbedUrl}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-800 text-white rounded-full text-sm hover:bg-amber-800 transition-colors"
              >
                <Check size={14} /> Enregistrer
              </button>
              <button
                onClick={() => setShowUrlModal(false)}
                className="py-3 px-5 border border-stone-200 text-stone-600 rounded-full text-sm hover:bg-stone-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
