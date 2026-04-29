import { useState } from 'react';
import { Phone, Mail, MapPin, Send, Check, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ContactSection() {
  const { content, setContent, isAdminLoggedIn } = useApp();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [phoneVal, setPhoneVal] = useState(content.phone);
  const [emailVal, setEmailVal] = useState(content.email);
  const [addressVal, setAddressVal] = useState(content.address);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', email: '', message: '' });
    }, 4000);
  };

  const savePhone = () => { setContent({ phone: phoneVal }); setEditingPhone(false); };
  const saveEmail = () => { setContent({ email: emailVal }); setEditingEmail(false); };
  const saveAddress = () => { setContent({ address: addressVal }); setEditingAddress(false); };

  const mapsQuery = encodeURIComponent(content.address);

  return (
    <section id="contact" className="py-24 md:py-32 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="text-amber-700/60 text-xs tracking-[0.4em] uppercase mb-4 block"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Nous joindre
          </span>
          <h2
            className="text-4xl md:text-5xl font-light text-stone-800 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Contactez-nous
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-12 bg-amber-300/50" />
            <div className="w-2 h-2 rounded-full bg-amber-300/50" />
            <div className="h-px w-12 bg-amber-300/50" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Info */}
          <div className="space-y-8">
            <div>
              <h3
                className="text-2xl font-light text-stone-800 mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Au fil de soi
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-8"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                Notre équipe est à votre disposition pour répondre à toutes vos questions
                et vous aider à choisir le soin le plus adapté à vos besoins.
              </p>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone size={16} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-400 mb-1 tracking-wide uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Téléphone
                </p>
                {editingPhone ? (
                  <div className="flex gap-2">
                    <input
                      value={phoneVal}
                      onChange={e => setPhoneVal(e.target.value)}
                      className="flex-1 border-b border-amber-300 bg-transparent text-stone-700 text-sm focus:outline-none pb-1"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    />
                    <button onClick={savePhone} className="text-amber-700 hover:text-amber-800">
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${content.phone}`}
                      className="text-stone-700 hover:text-amber-700 transition-colors font-medium"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      {content.phone}
                    </a>
                    {isAdminLoggedIn && (
                      <button onClick={() => setEditingPhone(true)} className="text-stone-300 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                )}
                <a
                  href={`tel:${content.phone}`}
                  className="btn-luxury inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-amber-700 text-white text-xs rounded-full hover:bg-amber-800 transition-colors"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  <Phone size={12} /> Appeler maintenant
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={16} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-400 mb-1 tracking-wide uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Email
                </p>
                {editingEmail ? (
                  <div className="flex gap-2">
                    <input
                      value={emailVal}
                      onChange={e => setEmailVal(e.target.value)}
                      className="flex-1 border-b border-amber-300 bg-transparent text-stone-700 text-sm focus:outline-none pb-1"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    />
                    <button onClick={saveEmail} className="text-amber-700 hover:text-amber-800">
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${content.email}`}
                      className="text-stone-700 hover:text-amber-700 transition-colors"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      {content.email}
                    </a>
                    {isAdminLoggedIn && (
                      <button onClick={() => setEditingEmail(true)} className="text-stone-300 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={16} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-400 mb-1 tracking-wide uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Adresse
                </p>
                {editingAddress ? (
                  <div className="flex gap-2">
                    <input
                      value={addressVal}
                      onChange={e => setAddressVal(e.target.value)}
                      className="flex-1 border-b border-amber-300 bg-transparent text-stone-700 text-sm focus:outline-none pb-1"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    />
                    <button onClick={saveAddress} className="text-amber-700 hover:text-amber-800">
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-stone-700" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {content.address}
                    </p>
                    {isAdminLoggedIn && (
                      <button onClick={() => setEditingAddress(true)} className="text-stone-300 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-stone-100 h-48">
              <iframe
                src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=15`}
                width="100%"
                height="100%"
                loading="lazy"
                title="Localisation Au fil de soi"
                className="border-0"
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <h3
              className="text-2xl font-light text-stone-800 mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Envoyez-nous un message
            </h3>

            {sent ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-green-600" />
                </div>
                <p className="text-stone-700 font-medium mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}>
                  Message envoyé !
                </p>
                <p className="text-stone-400 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-5">
                <div>
                  <label className="text-stone-400 text-xs mb-2 block tracking-wide"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm bg-white"
                    placeholder="Marie Dupont"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
                <div>
                  <label className="text-stone-400 text-xs mb-2 block tracking-wide"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm bg-white"
                    placeholder="marie@email.com"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
                <div>
                  <label className="text-stone-400 text-xs mb-2 block tracking-wide"
                    style={{ fontFamily: "'Jost', sans-serif" }}>
                    Message *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                    rows={5}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm bg-white resize-none"
                    placeholder="Votre message..."
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-luxury flex items-center justify-center gap-2 py-3.5 bg-stone-800 text-white rounded-full text-sm hover:bg-amber-800 transition-colors"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  <Send size={15} /> Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
