'use client';
import React, { useEffect, useState } from 'react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  addWeeks, 
  subWeeks, 
  isSameDay, 
  parseISO, 
} from 'date-fns';
import { ro as localeRo } from 'date-fns/locale';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 - 20:00

export default function ProfessionalCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ clientName: '', date: '', time: '' });
  const [editingBooking, setEditingBooking] = useState<any>(null); 
  const [error, setError] = useState(""); 

  // Calculăm zilele săptămânii curente
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  // Fetch inițial
  const fetchBookings = async () => {
    const token = localStorage.getItem('voicero_token');
    const res = await fetch('http://localhost:3001/api/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openEditModal = (booking: any) => {
    setEditingBooking(booking);
    setFormData({ clientName: booking.clientName, date: booking.date, time: booking.time });
    setError("");
    setIsModalOpen(true);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem('voicero_token');
    
    const url = editingBooking 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${editingBooking.id}` 
      : '${process.env.NEXT_PUBLIC_API_URL}/api/bookings/manual';
    
    const method = editingBooking ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (res.status === 409) {
        setError("⚠️ Această oră este deja rezervată!");
        return;
      }

      if (res.ok) {
        setIsModalOpen(false);
        setEditingBooking(null);
        setFormData({ clientName: '', date: '', time: '' });
        fetchBookings(); // Refresh date fără reload de pagină
      }
    } catch (err) {
      setError("Eroare la conectarea cu serverul.");
    }
  };

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  const getBookingStyles = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    const minutes = parseInt(time.split(':')[1] || "0");
    const topOffset = (hour - 8) * 64 + (minutes / 60) * 64;
    return { top: `${topOffset}px` };
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: localeRo })}
          </h1>
          <p className="text-gray-500 text-sm">Gestionare rezervări PixelLab</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <button onClick={prevWeek} className="p-2 hover:bg-white rounded-lg transition-all">◀</button>
            <button onClick={goToday} className="px-4 py-1.5 bg-white shadow-sm border rounded-lg text-sm font-bold text-indigo-600">Azi</button>
            <button onClick={nextWeek} className="p-2 hover:bg-white rounded-lg transition-all">▶</button>
          </div>

          <button 
            onClick={() => { setEditingBooking(null); setFormData({clientName:'', date:'', time:''}); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
          >
            + Adaugă
          </button>
        </div>
      </header>

      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xl bg-white">
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50/50 text-center">
          <div className="p-4 border-r border-gray-200"></div>
          {weekDays.map((day) => (
            <div key={day.toString()} className={`p-4 border-r border-gray-200 last:border-0 ${isSameDay(day, new Date()) ? 'bg-indigo-50/50' : ''}`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{format(day, 'eee', { locale: localeRo })}</p>
              <p className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-gray-700'}`}>{format(day, 'd')}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 relative h-[832px] overflow-y-auto">
          <div className="sticky left-0 z-20 bg-gray-50 border-r border-gray-200">
            {HOURS.map((hour) => (
              <div key={hour} className="h-16 border-b border-gray-100 p-2 text-[10px] font-bold text-gray-400 text-right pr-4">{hour}:00</div>
            ))}
          </div>

          {weekDays.map((day, dayIdx) => (
            <div key={dayIdx} className="relative border-r border-gray-100 last:border-0">
              {HOURS.map((hour) => <div key={hour} className="h-16 border-b border-gray-50 w-full"></div>)}

              {bookings
                .filter((b: any) => isSameDay(parseISO(b.date), day))
                .map((booking: any) => (
                  <div
                    key={booking.id}
                    style={getBookingStyles(booking.time)}
                    onClick={() => openEditModal(booking)}
                    className="absolute left-1 right-1 p-2 bg-indigo-600 text-white rounded-xl shadow-lg z-10 border border-white/20 hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden"
                  >
                    <p className="text-[10px] font-black truncate">{booking.clientName}</p>
                    <p className="text-[9px] font-medium opacity-90">{booking.time}</p>
                  </div>
                ))}
            </div>
          ))} 
        </div>
      </div>

      {/* MODAL UNITAR (Adăugare & Editare) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingBooking ? 'Editează Programarea' : 'Programare Manuală'}
            </h2>
            
            {error && <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-red-700 text-xs font-bold">{error}</div>}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <input 
                required type="text" value={formData.clientName}
                placeholder="Nume Client"
                className="w-full bg-slate-50 border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  required type="date" value={formData.date}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
                <input 
                  required type="time" value={formData.time}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold border rounded-xl hover:bg-slate-50">Anulează</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg">Salvează</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}