import { useState } from 'react';
import {
  X, Calendar, Star, BarChart2, Settings, Trash2, Edit3,
  Check, Users, Clock, TrendingUp, Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../store/useStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

type Tab = 'dashboard' | 'appointments' | 'reviews' | 'settings';

interface AdminPanelProps {
  onClose: () => void;
}

function Dashboard() {
  const { appointments, reviews, SERVICES } = useApp();

  const totalApts = appointments.length;
  const uniqueClients = new Set(appointments.map(a => a.clientEmail)).size;
  const approvedReviews = reviews.filter(r => r.approved).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), -6 + i);
    const dateStr = format(d, 'yyyy-MM-dd');
    return {
      name: format(d, 'EEE', { locale: fr }),
      rdv: appointments.filter(a => a.date === dateStr).length,
    };
  });

  // Services distribution
  const serviceData = SERVICES.map(s => ({
    name: s.name.split(' ')[0],
    value: appointments.filter(a => a.service === s.name).length,
  })).filter(s => s.value > 0);

  const COLORS = ['#92400e', '#b45309', '#d97706', '#fbbf24'];

  // Popular time slots
  const slotCounts: Record<string, number> = {};
  appointments.forEach(a => {
    slotCounts[a.time] = (slotCounts[a.time] || 0) + 1;
  });
  const topSlots = Object.entries(slotCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([time, count]) => ({ time, count }));

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Rendez-vous', value: totalApts, icon: Calendar, color: 'bg-amber-50 text-amber-700' },
          { label: 'Clientes', value: uniqueClients, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Avis publiés', value: approvedReviews, icon: Star, color: 'bg-green-50 text-green-700' },
          { label: 'Note moy.', value: avgRating, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-light text-stone-800 mb-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {value}
            </div>
            <div className="text-xs text-stone-400" style={{ fontFamily: "'Jost', sans-serif" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly bar chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <h4 className="text-sm font-medium text-stone-700 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Rendez-vous — 7 derniers jours
          </h4>
          {totalApts > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f0ea" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1c1612', border: '1px solid #c4a882', borderRadius: '8px', color: '#faf9f6', fontSize: '12px' }}
                />
                <Bar dataKey="rdv" fill="#b45309" radius={[4, 4, 0, 0]} name="RDV" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-stone-300 text-sm"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Services pie */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <h4 className="text-sm font-medium text-stone-700 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Répartition des soins
          </h4>
          {serviceData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={160}>
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {serviceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {serviceData.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-stone-500" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {s.name} ({s.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-stone-300 text-sm"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Top slots */}
      {topSlots.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <h4 className="text-sm font-medium text-stone-700 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Créneaux les plus populaires
          </h4>
          <div className="space-y-3">
            {topSlots.map(({ time, count }) => (
              <div key={time} className="flex items-center gap-3">
                <span className="text-sm text-stone-500 w-12" style={{ fontFamily: "'Jost', sans-serif" }}>{time}</span>
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${(count / (topSlots[0]?.count || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-stone-400 w-6" style={{ fontFamily: "'Jost', sans-serif" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentsTab() {
  const { appointments, deleteAppointment, updateAppointment, addAppointment, SERVICES, TIME_SLOTS } = useApp();
  const [editId, setEditId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newApt, setNewApt] = useState({
    clientName: '', clientEmail: '', clientPhone: '', date: '', time: '', service: '', notes: ''
  });

  const filtered = appointments.filter(a =>
    a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.date.includes(searchTerm) ||
    a.service.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleAdd = () => {
    if (!newApt.clientName || !newApt.date || !newApt.time || !newApt.service) return;
    const service = SERVICES.find(s => s.name === newApt.service);
    const apt: Appointment = {
      id: Date.now().toString(),
      clientName: newApt.clientName,
      clientEmail: newApt.clientEmail,
      clientPhone: newApt.clientPhone,
      date: newApt.date,
      time: newApt.time,
      service: newApt.service,
      duration: service?.duration || 60,
      notes: newApt.notes,
      createdAt: new Date().toISOString(),
    };
    addAppointment(apt);
    setNewApt({ clientName: '', clientEmail: '', clientPhone: '', date: '', time: '', service: '', notes: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 bg-white focus:outline-none"
          style={{ fontFamily: "'Jost', sans-serif" }}
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 text-white rounded-xl text-sm hover:bg-amber-800 transition-colors"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5">
          <h4 className="text-sm font-medium text-stone-700 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Nouveau rendez-vous
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nom *" value={newApt.clientName}
              onChange={e => setNewApt(f => ({ ...f, clientName: e.target.value }))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white" style={{ fontFamily: "'Jost', sans-serif" }} />
            <input placeholder="Email" value={newApt.clientEmail}
              onChange={e => setNewApt(f => ({ ...f, clientEmail: e.target.value }))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white" style={{ fontFamily: "'Jost', sans-serif" }} />
            <input placeholder="Téléphone" value={newApt.clientPhone}
              onChange={e => setNewApt(f => ({ ...f, clientPhone: e.target.value }))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white" style={{ fontFamily: "'Jost', sans-serif" }} />
            <input type="date" value={newApt.date}
              onChange={e => setNewApt(f => ({ ...f, date: e.target.value }))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white" style={{ fontFamily: "'Jost', sans-serif" }} />
            <select value={newApt.time}
              onChange={e => setNewApt(f => ({ ...f, time: e.target.value }))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white" style={{ fontFamily: "'Jost', sans-serif" }}>
              <option value="">Heure *</option>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={newApt.service}
              onChange={e => setNewApt(f => ({ ...f, service: e.target.value }))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white" style={{ fontFamily: "'Jost', sans-serif" }}>
              <option value="">Soin *</option>
              {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <textarea placeholder="Notes" value={newApt.notes}
              onChange={e => setNewApt(f => ({ ...f, notes: e.target.value }))}
              className="col-span-2 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white resize-none" rows={2}
              style={{ fontFamily: "'Jost', sans-serif" }} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd}
              className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm hover:bg-amber-800 transition-colors"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              Créer
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm hover:bg-stone-50 transition-colors"
              style={{ fontFamily: "'Jost', sans-serif" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Appointments list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-stone-400" style={{ fontFamily: "'Jost', sans-serif" }}>
            {searchTerm ? 'Aucun résultat' : 'Aucun rendez-vous pour l\'instant'}
          </div>
        ) : (
          filtered.map(apt => (
            <div key={apt.id} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              {editId === apt.id ? (
                <EditAppointment apt={apt} onSave={(u) => { updateAppointment(apt.id, u); setEditId(null); }} onCancel={() => setEditId(null)} />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-800"
                        style={{ fontFamily: "'Jost', sans-serif" }}>
                        {apt.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>{apt.clientName}</p>
                        <p className="text-stone-400 text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>{apt.clientEmail}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-stone-500" style={{ fontFamily: "'Jost', sans-serif" }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {apt.time}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">{apt.service}</span>
                      <span className="text-stone-400">{apt.duration} min</span>
                    </div>
                    {apt.clientPhone && (
                      <p className="text-xs text-stone-400 mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                        📞 {apt.clientPhone}
                      </p>
                    )}
                    {apt.notes && (
                      <p className="text-xs text-stone-400 mt-1 italic" style={{ fontFamily: "'Jost', sans-serif" }}>
                        💬 {apt.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditId(apt.id)}
                      className="p-2 text-stone-400 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => deleteAppointment(apt.id)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EditAppointment({
  apt, onSave, onCancel
}: {
  apt: Appointment;
  onSave: (u: Partial<Appointment>) => void;
  onCancel: () => void;
}) {
  const { SERVICES, TIME_SLOTS } = useApp();
  const [form, setForm] = useState({
    clientName: apt.clientName,
    clientEmail: apt.clientEmail,
    clientPhone: apt.clientPhone,
    date: apt.date,
    time: apt.time,
    service: apt.service,
    notes: apt.notes,
  });

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-amber-50/30" placeholder="Nom"
          style={{ fontFamily: "'Jost', sans-serif" }} />
        <input value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-amber-50/30" placeholder="Email"
          style={{ fontFamily: "'Jost', sans-serif" }} />
        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-amber-50/30"
          style={{ fontFamily: "'Jost', sans-serif" }} />
        <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-amber-50/30"
          style={{ fontFamily: "'Jost', sans-serif" }}>
          {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
          className="col-span-2 border border-amber-200 rounded-lg px-3 py-2 text-sm bg-amber-50/30"
          style={{ fontFamily: "'Jost', sans-serif" }}>
          {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(form)}
          className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs hover:bg-amber-800 transition-colors"
          style={{ fontFamily: "'Jost', sans-serif" }}>
          <Check size={13} /> Sauvegarder
        </button>
        <button onClick={onCancel}
          className="px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg text-xs hover:bg-stone-50 transition-colors"
          style={{ fontFamily: "'Jost', sans-serif" }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

function ReviewsAdminTab() {
  const { reviews, deleteReview, updateReview } = useApp();
  const pending = reviews.filter(r => !r.approved);
  const approved = reviews.filter(r => r.approved);

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-amber-700 mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Jost', sans-serif" }}>
            <span className="w-5 h-5 rounded-full bg-amber-100 text-xs flex items-center justify-center">{pending.length}</span>
            En attente de modération
          </h4>
          <div className="space-y-3">
            {pending.map(r => (
              <div key={r.id} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-stone-700 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>{r.name}</p>
                    <div className="flex gap-0.5 my-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} />
                      ))}
                    </div>
                    <p className="text-stone-600 text-sm italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{r.comment}"</p>
                    <p className="text-stone-400 text-xs mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>{r.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateReview(r.id, { approved: true })}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      <Check size={12} /> Publier
                    </button>
                    <button onClick={() => deleteReview(r.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-3"
            style={{ fontFamily: "'Jost', sans-serif" }}>
            Avis publiés ({approved.length})
          </h4>
          <div className="space-y-3">
            {approved.map(r => (
              <div key={r.id} className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-stone-700 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>{r.name}</p>
                    <div className="flex gap-0.5 my-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} />
                      ))}
                    </div>
                    <p className="text-stone-600 text-sm italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{r.comment}"</p>
                    <p className="text-stone-400 text-xs mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>{r.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateReview(r.id, { approved: false })}
                      className="px-3 py-1.5 border border-stone-200 text-stone-500 rounded-lg text-xs hover:bg-stone-50 transition-colors"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      Masquer
                    </button>
                    <button onClick={() => deleteReview(r.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-12 text-stone-400" style={{ fontFamily: "'Jost', sans-serif" }}>
          Aucun avis pour l'instant
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { content, setContent } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...content });

  const handleSave = () => {
    setContent(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <h4 className="text-sm font-medium text-stone-700 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
          Textes du site
        </h4>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-stone-400 mb-1 block" style={{ fontFamily: "'Jost', sans-serif" }}>
              Titre héro
            </label>
            <input value={form.heroTitle} onChange={e => setForm(f => ({ ...f, heroTitle: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm" style={{ fontFamily: "'Jost', sans-serif" }} />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block" style={{ fontFamily: "'Jost', sans-serif" }}>
              Sous-titre héro
            </label>
            <textarea value={form.heroSubtitle} onChange={e => setForm(f => ({ ...f, heroSubtitle: e.target.value }))}
              rows={2} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm resize-none"
              style={{ fontFamily: "'Jost', sans-serif" }} />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block" style={{ fontFamily: "'Jost', sans-serif" }}>
              Titre section À propos
            </label>
            <input value={form.aboutTitle} onChange={e => setForm(f => ({ ...f, aboutTitle: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm" style={{ fontFamily: "'Jost', sans-serif" }} />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block" style={{ fontFamily: "'Jost', sans-serif" }}>
              Texte À propos
            </label>
            <textarea value={form.aboutText} onChange={e => setForm(f => ({ ...f, aboutText: e.target.value }))}
              rows={6} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm resize-none"
              style={{ fontFamily: "'Jost', sans-serif" }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <h4 className="text-sm font-medium text-stone-700 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
          Coordonnées
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-stone-400 mb-1 block" style={{ fontFamily: "'Jost', sans-serif" }}>Téléphone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm" style={{ fontFamily: "'Jost', sans-serif" }} />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block" style={{ fontFamily: "'Jost', sans-serif" }}>Email</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm" style={{ fontFamily: "'Jost', sans-serif" }} />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block" style={{ fontFamily: "'Jost', sans-serif" }}>Adresse</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm" style={{ fontFamily: "'Jost', sans-serif" }} />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-stone-800 text-white rounded-2xl text-sm hover:bg-amber-800 transition-colors flex items-center justify-center gap-2"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {saved ? <><Check size={16} /> Sauvegardé !</> : 'Enregistrer les modifications'}
      </button>
    </div>
  );
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { appointments, reviews } = useApp();
  const pendingReviews = reviews.filter(r => !r.approved).length;

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Tableau de bord', icon: BarChart2 },
    { id: 'appointments' as Tab, label: 'Rendez-vous', icon: Calendar, badge: appointments.length },
    { id: 'reviews' as Tab, label: 'Avis', icon: Star, badge: pendingReviews > 0 ? pendingReviews : undefined },
    { id: 'settings' as Tab, label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 modal-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-stone-50 h-full overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-light text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Panel Administrateur
            </h2>
            <p className="text-stone-400 text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>
              Au fil de soi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-stone-100 px-4 flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-700 text-amber-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              <tab.icon size={15} />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'appointments' && <AppointmentsTab />}
          {activeTab === 'reviews' && <ReviewsAdminTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
