import { useState } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdminLoginProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLogin({ onClose, onSuccess }: AdminLoginProps) {
  const { loginAdmin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const ok = loginAdmin(email, password);
    setLoading(false);
    if (ok) {
      onSuccess();
    } else {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 modal-backdrop flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center mx-auto mb-6">
          <Lock size={24} className="text-amber-400" />
        </div>

        <h2
          className="text-2xl font-light text-stone-800 text-center mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Accès administrateur
        </h2>
        <p
          className="text-stone-400 text-sm text-center mb-8"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Connectez-vous pour gérer votre site
        </p>

        {/* Hint */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-xs text-amber-700 space-y-1"
          style={{ fontFamily: "'Jost', sans-serif" }}>
          <p>📧 Email : <strong>admin@aufildesoi.fr</strong></p>
          <p>🔑 Mot de passe : <strong>Admin2024!</strong></p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="text-stone-400 text-xs mb-2 block tracking-wide"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm bg-stone-50"
              placeholder="admin@aufildesoi.fr"
              style={{ fontFamily: "'Jost', sans-serif" }}
            />
          </div>

          <div>
            <label
              className="text-stone-400 text-xs mb-2 block tracking-wide"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 pr-10 text-stone-700 text-sm bg-stone-50"
                placeholder="••••••••"
                style={{ fontFamily: "'Jost', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition-colors disabled:opacity-60 btn-luxury"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loader w-4 h-4" />
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
