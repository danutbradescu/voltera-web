'use client';
import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [prompt, setPrompt] = useState('');
  const [agentId, setAgentId] = useState(''); // ID-ul de Agent de la Retell
  const [llmId, setLlmId] = useState('');     // ID-ul de LLM de la Retell
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('voicero_token');
    if (token) {
    fetch('http://localhost:3001/api/agent/current', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
          if (data) {
            setPrompt(data.systemPrompt || '');
            setAgentId(data.retellAgentId || '');
            setLlmId(data.retellLlmId || '');
          }
        });
    }
  }, []);

  const handleSave = async () => {
  setLoading(true);
  setMessage('');
  // Schimbăm 'token' cu 'voicero_token'
  const token = localStorage.getItem('voicero_token'); 

  if (!token) {
    setMessage('❌ Nu s-a găsit sesiunea de logare. Te rugăm să te reloghezi.');
    setLoading(false);
    return;
  }

    try {
      const res = await fetch('http://localhost:3001/api/agent', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          prompt,
          retellAgentId: agentId,
          retellLlmId: llmId
        })
      });
      
      if (res.ok) setMessage('✅ Configurare salvată cu succes!');
      else setMessage('❌ Eroare la salvare.');
    } catch (e) {
      setMessage('❌ Eroare de conexiune.');
    }
    setLoading(false);
    
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configurare Asistent Vocal</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md border space-y-6">
        {/* Secțiunea Conectare Retell */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-md border border-blue-100">
          <div>
            <label className="block text-xs font-bold text-blue-800 uppercase">Retell Agent ID</label>
            <input 
              className="w-full p-2 border rounded mt-1 text-sm"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="agent_..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-800 uppercase">Retell LLM ID</label>
            <input 
              className="w-full p-2 border rounded mt-1 text-sm"
              value={llmId}
              onChange={(e) => setLlmId(e.target.value)}
              placeholder="llm_..."
            />
          </div>
        </div>

        {/* Secțiunea Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">
            Instrucțiuni (System Prompt)
          </label>
          <textarea
            className="w-full h-64 p-4 border rounded-md focus:ring-2 focus:ring-blue-500 text-gray-800 outline-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold"
        >
          {loading ? 'Se salvează...' : 'Salvează și Sincronizează cu Retell'}
        </button>
        
        {message && <div className={`p-3 rounded text-center font-bold ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
      </div>
    </div>
  );
}