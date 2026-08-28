import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDisplay(dateStr, timeStr) {
  if (!dateStr && !timeStr) return '';
  const parts = [];
  if (dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    parts.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
  }
  if (timeStr) {
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr % 12 || 12;
    parts.push(`${hr12}:${m} ${ampm}`);
  }
  return parts.join(' · ');
}

export default function DateTimePicker({ date, time, onDateChange, onTimeChange, label = 'Date & Time' }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('date');
  const [viewYear, setViewYear] = useState(() => date ? new Date(date + 'T00:00:00').getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => date ? new Date(date + 'T00:00:00').getMonth() : new Date().getMonth());
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  const selectDate = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
    setStep('time');
  };

  const selectTime = (t) => {
    onTimeChange(t);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <label className="label">{label}</label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setStep(date ? 'time' : 'date'); }}
        className={`w-full px-4 py-3 rounded-xl bg-white/[0.08] border text-left text-sm transition-colors backdrop-blur-sm ${
          date || time ? 'border-primary/40 text-text' : 'border-border text-muted'
        }`}
      >
        {formatDisplay(date, time) || 'Select date and time…'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 mt-2 z-50 bg-[#1e2c49] border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setStep('date')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  step === 'date' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'
                }`}
              >
                📅 Date
              </button>
              <button
                type="button"
                onClick={() => setStep('time')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  step === 'time' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'
                }`}
              >
                🕐 Time
              </button>
            </div>

            {/* Calendar */}
            {step === 'date' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 text-muted transition-colors">
                    ←
                  </button>
                  <span className="font-medium text-sm">
                    {MONTHS[viewMonth]} {viewYear}
                  </span>
                  <button type="button" onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 text-muted transition-colors">
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-xs text-muted py-1 font-medium">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const d = new Date(viewYear, viewMonth, day);
                    d.setHours(0, 0, 0, 0);
                    const isPast = d < today;
                    const isSelected = date === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = d.getTime() === today.getTime();

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => selectDate(day)}
                        className={`relative aspect-square flex items-center justify-center rounded-xl text-sm transition-all ${
                          isPast
                            ? 'text-white/20 cursor-not-allowed'
                            : isSelected
                              ? 'bg-primary text-black font-bold shadow-lg shadow-primary/30'
                              : isToday
                                ? 'bg-accent/20 text-accent font-semibold hover:bg-accent/30'
                                : 'text-text hover:bg-white/10'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time slots */}
            {step === 'time' && (
              <div className="p-4 max-h-[320px] overflow-y-auto">
                <p className="text-xs text-muted mb-3">Pick a time slot</p>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((t) => {
                    const [h, m] = t.split(':');
                    const hr = parseInt(h, 10);
                    const ampm = hr >= 12 ? 'PM' : 'AM';
                    const hr12 = hr % 12 || 12;
                    const label = `${hr12}:${m} ${ampm}`;
                    const isSelected = time === t;

                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => selectTime(t)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-black shadow-lg shadow-primary/30'
                            : 'bg-white/5 text-muted hover:bg-white/10 hover:text-text border border-border'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted mt-3 text-center">Business hours: 8:00 AM — 9:00 PM</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
