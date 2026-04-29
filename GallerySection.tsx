import { useRef, useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GalleryImage } from '../store/useStore';

export default function GallerySection() {
  const { gallery, addGalleryImage, removeGalleryImage, isAdminLoggedIn } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    files.forEach(file => readAndAdd(file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    files.forEach(file => readAndAdd(file));
    e.target.value = '';
  };

  const readAndAdd = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newImg: GalleryImage = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        src: ev.target?.result as string,
        alt: file.name.replace(/\.[^.]+$/, ''),
        isCustom: true,
      };
      addGalleryImage(newImg);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id="galerie" className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="text-amber-700/60 text-xs tracking-[0.4em] uppercase mb-4 block"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Galerie
          </span>
          <h2
            className="text-4xl md:text-5xl font-light text-stone-800 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Notre univers
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-12 bg-amber-300/50" />
            <div className="w-2 h-2 rounded-full bg-amber-300/50" />
            <div className="h-px w-12 bg-amber-300/50" />
          </div>
        </div>

        {/* Admin upload zone */}
        {isAdminLoggedIn && (
          <div
            ref={dropZoneRef}
            className={`drop-zone rounded-2xl p-8 mb-10 text-center cursor-pointer transition-all duration-300 ${
              dragOver ? 'drag-over bg-amber-50' : 'bg-stone-50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                dragOver ? 'bg-amber-100' : 'bg-stone-100'
              }`}>
                <Upload size={24} className="text-amber-700/60" />
              </div>
              <div>
                <p className="text-stone-700 font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {dragOver ? 'Relâchez pour ajouter' : 'Glissez des photos ici'}
                </p>
                <p className="text-stone-400 text-sm mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                  ou cliquez pour sélectionner (JPG, PNG, WebP)
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}

        {/* Masonry gallery */}
        {gallery.length > 0 ? (
          <div className="masonry-grid">
            {gallery.map((img, i) => (
              <div key={img.id} className="masonry-item gallery-item rounded-xl overflow-hidden shadow-md cursor-pointer group relative"
                onClick={() => setLightbox(img)}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full object-cover"
                  style={{
                    minHeight: i % 3 === 0 ? '300px' : i % 3 === 1 ? '220px' : '260px',
                    maxHeight: i % 3 === 0 ? '400px' : i % 3 === 1 ? '280px' : '320px',
                  }}
                  loading="lazy"
                />
                <div className="gallery-overlay" />

                {/* Admin remove */}
                {isAdminLoggedIn && (
                  <button
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                    onClick={(e) => { e.stopPropagation(); removeGalleryImage(img.id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white/90 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>{img.alt}</p>
                </div>
              </div>
            ))}

            {/* Admin: add tile */}
            {isAdminLoggedIn && (
              <div
                className="masonry-item rounded-xl border-2 border-dashed border-amber-200 flex items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-300"
                style={{ minHeight: '200px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <Plus size={28} className="text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-600/70 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>Ajouter une photo</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-stone-400">
            <div className="text-5xl mb-4">🖼️</div>
            <p style={{ fontFamily: "'Jost', sans-serif" }}>
              {isAdminLoggedIn ? 'Glissez des photos pour les ajouter à la galerie' : 'La galerie sera bientôt disponible'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 modal-backdrop flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 text-white/60 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
            {lightbox.alt}
          </p>
        </div>
      )}
    </section>
  );
}
