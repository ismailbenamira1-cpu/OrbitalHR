import React, { useState } from 'react';
import { Edit3, Trash2, MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';

// ==========================================
// COMPLIANCE COPILOT COMPONENT
// ==========================================
export function ComplianceCopilot({ employees }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your Orbital Compliance Copilot. Ask me anything about your active roster, tax risks, visa day-counts, or social security treaties." }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery;
    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch('/api/compliance-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, roster: employees })
      });

      const data = await response.json();

      if (data.success && data.answer) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error: " + (data.error || "Unknown error") }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Failed to connect to the AI Compliance Assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3.5 text-white shadow-xl hover:bg-indigo-700 transition transform hover:scale-105 font-medium"
        >
          <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
          <span>Ask Compliance Copilot</span>
        </button>
      ) : (
        <div className="flex flex-col h-[500px] w-[380px] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-300" />
              <span className="font-semibold text-sm">Orbital Compliance Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded p-1 hover:bg-indigo-800 text-slate-300 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line shadow-sm ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 rounded-xl px-3 py-2 text-xs italic shadow-sm animate-pulse">
                  Analyzing roster & webapp data...
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-3 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask e.g., 'Who is approaching PE risk?'..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  // Keep your existing employee state and handlers here
  const [employees, setEmployees] = useState([
    {
      id: '1',
      name: 'Sarah Jenkins',
      homeCountry: 'US',
      hostCountry: 'Canada',
      hostRegion: 'Ontario (CA)',
      daysUsed: 42,
      role: 'Engineering Lead',
      peRisk: 'MODERATE',
      rule: { visaLimitDays: 183 },
      ssInfo: { form: 'A1 / Certificate of Coverage' },
      recommendation: 'Track 90-day threshold'
    }
  ]);

  const handleDeleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">OrbitalHR - Compliance Dashboard</h1>

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{emp.name}</div>
                    <div className="text-xs text-slate-500">{emp.homeCountry} · {emp.role}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{emp.hostRegion}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-900">{emp.daysUsed} / {emp.rule.visaLimitDays}d</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800">
                      {emp.peRisk}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-emerald-700">{emp.ssInfo.form}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => handleDeleteEmployee(emp.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-rose-600" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating AI Compliance Copilot Widget */}
      <ComplianceCopilot employees={employees} />
    </div>
  );
}
