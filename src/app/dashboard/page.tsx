'use client';
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardHome() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('voicero_token');
    fetch('http://localhost:3001/api/analytics/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div className="p-8 font-medium animate-pulse text-gray-400">Se încarcă universul tău AI...</div>;

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans">
      {/* Upper Section: Welcome & Actions */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Controlul total asupra inteligenței tale vocale.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard/settings'}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
        >
          <span>⚙️</span> Setări Agent
        </button>
      </div>

      {/* KPI Stats - Minimalist Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Apeluri Totale', value: data.stats.totalCalls, trend: '+12%', color: 'text-indigo-600' },
          { label: 'Durată Medie', value: data.stats.avgDuration, trend: 'Stable', color: 'text-slate-900' },
          { label: 'Rată Conversie', value: data.stats.successRate, trend: '+2%', color: 'text-emerald-600' },
          { label: 'Timp Economisit', value: data.stats.activeMinutes + ' min', trend: 'Live', color: 'text-orange-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs font-bold text-slate-400">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Volum Apeluri <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded">Ultima Săptămână</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="apeluri" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status & Recent Side Section */}
        <div className="space-y-8">
          {/* Active Agent Pulse */}
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🤖</div>
             <h3 className="text-xl font-bold mb-6">Status Andra</h3>
             <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner">👩‍💼</div>
               <div>
                 <p className="font-bold">PixelLab Receptionist</p>
                 <div className="flex items-center gap-2 text-xs text-indigo-300">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                    Sincronizat cu Retell AI
                 </div>
               </div>
             </div>
             <div className="space-y-3 text-sm opacity-90">
                <div className="flex justify-between"><span>Voce</span><span className="font-medium">Română (Premium)</span></div>
                <div className="flex justify-between"><span>Model</span><span className="font-medium">GPT-4o Optimized</span></div>
             </div>
          </div>

          {/* Recent Activity Mini-List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Apeluri Recente</h3>
            <div className="space-y-4">
              {data.recentCalls.map((call: any, i: number) => (
                <div key={i} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs">📞</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{call.summary || 'Apel în curs...'}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{new Date(call.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">OK</span>
                </div>
              ))}
              {data.recentCalls.length === 0 && <p className="text-xs text-slate-400 italic">Nicio activitate încă.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}