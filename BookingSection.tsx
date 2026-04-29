import { useState } from 'react';
import { Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../store/useStore';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function BookingSection() {
  const { SERVICES, getAvailableSlots, getOccupiedSlots, addAppointment, TIME_SLOTS } = useApp();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = startOfDay(new Date());

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startWeekDay = getDay(monthStart); // 0=Sun, adjust for Mon start
  const emptyDays = (startWeekDay + 6) % 7; // Mon-start offset

  const isDateDisabled = (date: Date) =>
    isBefore(date, today) || getDay(date) === 0; // No Sundays

  const availableSlots = selectedDate
    ? getAvailableSlots(format(selectedDate, 'yyyy-MM-dd'))
    : [];
  const occupiedSlots = selectedDate
    ? getOccupiedSlots(format(selectedDate, 'yyyy-MM-dd'))
    : [];

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !form.name || !form.email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const service = SERVICES.find(s => s.id === selectedService)!;
    const apt: Appointment = {
      id: Date.now().toString(),
      clientName: form.name,
      clientEmail: form.email,
      clientPhone: form.phone,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      service: service.name,
      duration: service.duration,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };
    addAppointment(apt);
    setLoading(false);
    setSubmitted(true);
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService('');
    setSelectedDate(null);
    setSelectedTime('');
    setForm({ name: '', email: '', phone: '', notes: '' });
    setSubmitted(false);
  };

  const selectedServiceObj = SERVICES.find(s => s.id === selectedService);

  if (submitted) {
    return (
      <section id="reservation" className="py-24 md:py-32 bg-white">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2
            className="text-3xl font-light text-stone-800 mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Réservation confirmée !
          </h2>
          <p className="text-stone-500 mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
            Merci, {form.name}. Votre rendez-vous a bien été enregistré.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mt-6 text-left">
            <div className="space-y-2 text-sm text-stone-600" style={{ fontFamily: "'Jost', sans-serif" }}>
              <div className="flex justify-between">
                <span className="text-stone-400">Soin</span>
                <span className="font-medium">{selectedServiceObj?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Date</span>
                <span className="font-medium">{selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Heure</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Durée</span>
                <span className="font-medium">{selectedServiceObj?.duration} min</span>
              </div>
            </div>
          </div>
          <p className="text-stone-400 text-sm mt-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Un email de confirmation vous sera envoyé à {form.email}
          </p>
          <button
            onClick={resetBooking}
            className="mt-8 btn-luxury px-7 py-3 bg-stone-800 text-white rounded-full text-sm hover:bg-amber-800 transition-colors"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Nouvelle réservation
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="reservation" className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="text-amber-700/60 text-xs tracking-[0.4em] uppercase mb-4 block"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Rendez-vous
          </span>
          <h2
            className="text-4xl md:text-5xl font-light text-stone-800 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Réservez votre soin
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-12 bg-amber-300/50" />
            <div className="w-2 h-2 rounded-full bg-amber-300/50" />
            <div className="h-px w-12 bg-amber-300/50" />
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[
            { n: 1, label: 'Soin' },
            { n: 2, label: 'Date & Heure' },
            { n: 3, label: 'Informations' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step >= n
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {step > n ? <CheckCircle size={16} /> : n}
                </div>
                <span className={`text-xs ${step >= n ? 'text-stone-700' : 'text-stone-300'}`}
                  style={{ fontFamily: "'Jost', sans-serif" }}>
                  {label}
                </span>
              </div>
              {n < 3 && (
                <div className={`w-16 h-px transition-colors duration-300 ${step > n ? 'bg-stone-800' : 'bg-stone-200'} -mt-5`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Service selection */}
        {step === 1 && (
          <div className="animate-scale-in">
            <h3
              className="text-xl font-light text-stone-700 text-center mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Choisissez votre soin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICES.map(service => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service.id); setStep(2); }}
                  className={`group text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                    selectedService === service.id
                      ? 'border-stone-800 bg-stone-50'
                      : 'border-stone-100 hover:border-stone-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4
                      className="text-lg font-light text-stone-800 group-hover:text-amber-800 transition-colors"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {service.name}
                    </h4>
                    <span
                      className="text-amber-700 font-light text-lg"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {service.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={13} className="text-stone-400" />
                    <span className="text-stone-400 text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {service.duration} min
                    </span>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                    {service.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="animate-scale-in">
            <h3
              className="text-xl font-light text-stone-700 text-center mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Choisissez une date et un créneau
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Calendar */}
              <div className="bg-stone-50 rounded-2xl p-6">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                    className="p-2 rounded-full hover:bg-stone-200 transition-colors"
                    disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
                  >
                    <ChevronLeft size={18} className="text-stone-600" />
                  </button>
                  <span
                    className="text-stone-700 font-medium capitalize"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}
                  >
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                    className="p-2 rounded-full hover:bg-stone-200 transition-colors"
                  >
                    <ChevronRight size={18} className="text-stone-600" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className="text-center text-xs text-stone-400 py-1"
                      style={{ fontFamily: "'Jost', sans-serif" }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {Array(emptyDays).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {days.map(day => {
                    const disabled = isDateDisabled(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, today);
                    const hasSlots = !disabled && getAvailableSlots(format(day, 'yyyy-MM-dd')).length > 0;

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => { if (!disabled) { setSelectedDate(day); setSelectedTime(''); } }}
                        disabled={disabled}
                        className={`
                          aspect-square rounded-full text-sm flex items-center justify-center transition-all duration-200
                          ${isSelected ? 'bg-stone-800 text-white shadow-md' : ''}
                          ${!isSelected && isToday ? 'border border-amber-400 text-amber-700' : ''}
                          ${!isSelected && !disabled ? 'hover:bg-stone-200 text-stone-700' : ''}
                          ${disabled ? 'text-stone-300 cursor-not-allowed' : ''}
                          ${!isSelected && !disabled && hasSlots ? 'font-medium' : ''}
                        `}
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-stone-400" style={{ fontFamily: "'Jost', sans-serif" }}>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-stone-800" />
                    <span>Sélectionné</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-amber-400" />
                    <span>Aujourd'hui</span>
                  </div>
                </div>
              </div>

              {/* Time slots */}
              <div>
                {selectedDate ? (
                  <>
                    <p className="text-stone-600 mb-4 font-medium capitalize" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map(slot => {
                        const available = availableSlots.includes(slot);
                        const occupied = occupiedSlots.includes(slot);
                        const isSelected = selectedTime === slot;

                        return (
                          <button
                            key={slot}
                            onClick={() => available && setSelectedTime(slot)}
                            disabled={!available}
                            className={`
                              py-2.5 rounded-xl text-sm transition-all duration-200
                              ${isSelected ? 'bg-stone-800 text-white shadow-md' : ''}
                              ${!isSelected && available ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : ''}
                              ${occupied ? 'bg-stone-50 text-stone-300 cursor-not-allowed line-through' : ''}
                            `}
                            style={{ fontFamily: "'Jost', sans-serif" }}
                          >
                            <span>{slot}</span>
                            {occupied && (
                              <span className="block text-xs text-stone-300">Occupé</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Calendar size={40} className="text-stone-200 mb-4" />
                    <p className="text-stone-400 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Sélectionnez une date pour voir les créneaux disponibles
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 border border-stone-200 text-stone-600 rounded-full text-sm hover:bg-stone-50 transition-colors"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                <ChevronLeft size={16} /> Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex items-center gap-2 px-6 py-2.5 bg-stone-800 text-white rounded-full text-sm hover:bg-amber-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed btn-luxury"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Continuer <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Client info */}
        {step === 3 && (
          <div className="animate-scale-in max-w-lg mx-auto">
            {/* Summary */}
            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 mb-8">
              <p className="text-xs text-amber-700/60 mb-3 tracking-wide uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                Récapitulatif
              </p>
              <div className="space-y-1.5 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
                <div className="flex justify-between text-stone-600">
                  <span className="text-stone-400">Soin</span>
                  <span className="font-medium">{selectedServiceObj?.name}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="text-stone-400">Date</span>
                  <span className="font-medium capitalize">
                    {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : ''}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="text-stone-400">Heure</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="text-stone-400">Prix</span>
                  <span className="font-medium text-amber-700">{selectedServiceObj?.price}</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-light text-stone-700 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Vos coordonnées
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-stone-500 text-xs mb-1.5 block tracking-wide" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm bg-white"
                  placeholder="Marie Dupont"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
              <div>
                <label className="text-stone-500 text-xs mb-1.5 block tracking-wide" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm bg-white"
                  placeholder="marie@email.com"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
              <div>
                <label className="text-stone-500 text-xs mb-1.5 block tracking-wide" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm bg-white"
                  placeholder="+33 6 00 00 00 00"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
              <div>
                <label className="text-stone-500 text-xs mb-1.5 block tracking-wide" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Notes (optionnel)
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm bg-white resize-none"
                  placeholder="Informations particulières, allergies..."
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 border border-stone-200 text-stone-600 rounded-full text-sm hover:bg-stone-50 transition-colors"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                <ChevronLeft size={16} /> Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.email || loading}
                className="flex items-center gap-2 px-7 py-2.5 bg-stone-800 text-white rounded-full text-sm hover:bg-amber-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed btn-luxury"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {loading ? (
                  <>
                    <div className="loader w-4 h-4" />
                    Confirmation...
                  </>
                ) : (
                  'Confirmer la réservation'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
