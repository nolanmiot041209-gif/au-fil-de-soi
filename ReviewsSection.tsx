import { useState } from 'react';
import { Star, Plus, Trash2, Check, X, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Review } from '../store/useStore';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!onChange}
        >
          <Star
            size={18}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-stone-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const { reviews, addReview, deleteReview, updateReview, isAdminLoggedIn } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', comment: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);

  const visibleReviews = isAdminLoggedIn
    ? reviews
    : reviews.filter(r => r.approved);

  const submitReview = () => {
    if (!form.name.trim() || !form.comment.trim()) return;
    const review: Review = {
      id: Date.now().toString(),
      name: form.name.trim(),
      comment: form.comment.trim(),
      rating: form.rating,
      date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
      approved: false,
    };
    addReview(review);
    setForm({ name: '', comment: '', rating: 5 });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
  };

  const avgRating = visibleReviews.length > 0
    ? (visibleReviews.reduce((sum, r) => sum + r.rating, 0) / visibleReviews.length).toFixed(1)
    : '—';

  return (
    <section id="avis" className="py-24 md:py-32 bg-stone-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="text-amber-400/60 text-xs tracking-[0.4em] uppercase mb-4 block"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Témoignages
          </span>
          <h2
            className="text-4xl md:text-5xl font-light text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ce que disent nos clientes
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-12 bg-amber-500/30" />
            <div className="w-2 h-2 rounded-full bg-amber-500/30" />
            <div className="h-px w-12 bg-amber-500/30" />
          </div>

          {/* Stats */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="text-center">
                <div className="text-4xl font-light text-amber-400" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {avgRating}
                </div>
                <div className="text-stone-500 text-xs mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>Note moyenne</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-4xl font-light text-amber-400" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {reviews.length}
                </div>
                <div className="text-stone-500 text-xs mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>Avis déposés</div>
              </div>
            </div>
          )}
        </div>

        {/* Reviews grid */}
        {visibleReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {visibleReviews.map((review) => (
              <div
                key={review.id}
                className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                  review.approved
                    ? 'bg-white/5 border-white/10 hover:bg-white/8'
                    : 'bg-amber-900/10 border-amber-700/20'
                }`}
              >
                {/* Admin controls */}
                {isAdminLoggedIn && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    {!review.approved && (
                      <button
                        onClick={() => updateReview(review.id, { approved: true })}
                        className="p-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                        title="Approuver"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    {review.approved && (
                      <button
                        onClick={() => updateReview(review.id, { approved: false })}
                        className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition-colors"
                        title="Masquer"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {/* Status badge (admin only) */}
                {isAdminLoggedIn && (
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-3 ${
                    review.approved
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-amber-600/20 text-amber-400'
                  }`} style={{ fontFamily: "'Jost', sans-serif" }}>
                    {review.approved ? 'Publié' : 'En attente'}
                  </span>
                )}

                {/* Quote */}
                <div className="text-amber-400/30 text-5xl font-serif leading-none mb-2">"</div>

                <StarRating value={review.rating} />

                <p
                  className="text-stone-300 text-sm leading-relaxed mt-3 mb-4 italic"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px' }}
                >
                  {review.comment}
                </p>

                <div className="border-t border-white/5 pt-4">
                  <p className="text-white font-medium text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {review.name}
                  </p>
                  <p className="text-stone-500 text-xs mt-0.5" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {review.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-12">
            <div className="text-4xl mb-4">⭐</div>
            <p className="text-stone-500" style={{ fontFamily: "'Jost', sans-serif" }}>
              Aucun avis pour l'instant. Soyez la première à partager votre expérience !
            </p>
          </div>
        )}

        {/* Add review button */}
        {!showForm && !submitted && (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="btn-luxury inline-flex items-center gap-2 px-7 py-3 border border-amber-600/30 text-amber-400/80 hover:text-amber-300 hover:border-amber-500/50 rounded-full text-sm transition-all duration-300"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              <Plus size={16} /> Laisser un avis
            </button>
          </div>
        )}

        {/* Success */}
        {submitted && (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-900/20 border border-green-700/30 rounded-2xl text-green-400">
              <ThumbsUp size={18} />
              <span style={{ fontFamily: "'Jost', sans-serif" }}>
                Merci ! Votre avis est en attente de modération.
              </span>
            </div>
          </div>
        )}

        {/* Review form */}
        {showForm && !submitted && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3
                className="text-xl font-light text-white mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Partagez votre expérience
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-stone-400 text-xs mb-2 block tracking-wide"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    Votre prénom *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-600/50"
                    placeholder="Marie"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  />
                </div>

                <div>
                  <label className="text-stone-400 text-xs mb-2 block tracking-wide"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    Note *
                  </label>
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>

                <div>
                  <label className="text-stone-400 text-xs mb-2 block tracking-wide"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    Votre commentaire *
                  </label>
                  <textarea
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-600/50 resize-none"
                    placeholder="Décrivez votre expérience..."
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={submitReview}
                    disabled={!form.name.trim() || !form.comment.trim()}
                    className="flex-1 py-3 bg-amber-700 text-white rounded-full text-sm hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    Envoyer mon avis
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setForm({ name: '', comment: '', rating: 5 }); }}
                    className="py-3 px-5 border border-white/10 text-stone-400 rounded-full text-sm hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
