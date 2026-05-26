'use client';
import React, { useEffect, useState } from 'react';

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('voicero_token');
    fetch('http://localhost:3001/api/calls', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCalls(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Istoric Apeluri</h1>
          <p className="text-slate-500 text-sm">Monitorizează performanța asistentului tău în timp real.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Apeluri */}
          <div className="lg:col-span-2 space-y-4">
            {calls.map((call: any) => (
              <div 
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer ${
                  selectedCall?.id === call.id ? 'border-indigo-500 ring-2 ring-indigo-50' : 'border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">📞</div>
                    <div>
                      <p className="font-bold text-slate-800">{call.agent?.name || 'Asistent'}</p>
                      <p className="text-xs text-slate-400">{new Date(call.createdAt).toLocaleString('ro-RO')}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    call.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {call.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-1 italic">
                  "{call.summary || 'Niciun rezumat disponibil încă.'}"
                </p>
              </div>
            ))}
          </div>

          {/* Detalii Apel & Player Audio */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 h-fit sticky top-8">
            {selectedCall ? (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-4">Detaliu Apel</h3>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rezumat AI</label>
                  <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedCall.summary || 'Se procesează rezumatul...'}
                  </p>
                </div>

                {/* AICI INTEGRĂM AUDIO PLAYER-UL */}
                {selectedCall.recordingUrl && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Înregistrare Audio</label>
                    <audio controls className="w-full h-10">
                      <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                      Browser-ul tău nu suportă player audio.
                    </audio>
                  </div>
                )}

                <div className="pt-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ID Apel:</span>
                    <span className="font-mono text-slate-600">{selectedCall.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Durată:</span>
                    <span className="text-slate-600">2m 14s</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">👈</div>
                <p className="text-slate-400 text-sm italic">Selectează un apel pentru a vedea detaliile și a asculta înregistrarea.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}