import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, ShieldAlert, FileText, Plus, Search, Filter, 
  Download, Edit3, Trash2, Bot, Sparkles, Send, X, CheckCircle2, AlertTriangle, Globe 
} from 'lucide-react';

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
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3.5 text-white shadow-2xl hover:bg-indigo-700 transition transform hover:scale-105 font-medium"
        >
          <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
          <span>Ask Compliance Copilot</span>
        </button>
      ) : (
        <div className="flex flex-col h-[520px] w-[390px] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-300" />
              <div>
                <span className="font-semibold text-sm block">Orbital Compliance Copilot</span>
                <span className="text-[10px] text-indigo-200">Powered by Gemini & Roster Context</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded p-1 hover:bg-indigo-800 text-slate-300 hover:text-white transition">
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
                  Analyzing active roster & tax treaties...
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
    },
    {
      id: '2',
      name: 'Marcus Vance',
      homeCountry: 'Canada',
      hostCountry: 'United Kingdom',
      hostRegion: 'England (UK)',
      daysUsed: 145,
      role: 'Product Director',
      peRisk: 'HIGH',
      rule: { visaLimitDays: 180 },
      ssInfo: { form: 'Totalization Certificate' },
      recommendation: 'EOR Graduation Recommended'
    },
    {
      id: '3',
      name: 'Elena Rostova',
      homeCountry: 'US',
      hostCountry: 'Germany',
      hostRegion: 'Bavaria (DE)',
      daysUsed: 28,
      role: 'Senior Architect',
      peRisk: 'LOW',
      rule: { visaLimitDays: 90 },
      ssInfo: { form: 'Certificate of Coverage' },
      recommendation: 'Compliant under treaty'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);
  
  const [empForm, setEmpForm] = useState({
    name: '',
    homeCountry: 'US',
    hostCountry: 'Canada',
    hostRegion: 'Ontario (CA)',
    daysUsed: 30,
    role: '',
    peRisk: 'LOW',
    visaLimitDays: 183,
    form: 'Certificate of Coverage',
    recommendation: 'Standard monitoring'
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.hostRegion.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = filterRisk === 'ALL' || emp.peRisk === filterRisk;
      return matchesSearch && matchesRisk;
    });
  }, [employees, searchQuery, filterRisk]);

  const handleOpenAddModal = () => {
    setEditingEmpId(null);
    setEmpForm({
      name: '',
      homeCountry: 'US',
      hostCountry: 'Canada',
      hostRegion: 'Ontario (CA)',
      daysUsed: 30,
      role: '',
      peRisk: 'LOW',
      visaLimitDays: 183,
      form: 'Certificate of Coverage',
      recommendation: 'Standard monitoring'
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmpId(emp.id);
    setEmpForm({
      name: emp.name,
      homeCountry: emp.homeCountry,
      hostCountry: emp.hostCountry,
      hostRegion: emp.hostRegion,
      daysUsed: emp.daysUsed,
      role: emp.role,
      peRisk: emp.peRisk,
      visaLimitDays: emp.rule?.visaLimitDays || 183,
      form: emp.ssInfo?.form || 'Certificate of Coverage',
      recommendation: emp.recommendation
    });
    setShowAddModal(true);
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.role) return;

    if (editingEmpId) {
      setEmployees(prev => prev.map(item => item.id === editingEmpId ? {
        ...item,
        name: empForm.name,
        homeCountry: empForm.homeCountry,
        hostCountry: empForm.hostCountry,
        hostRegion: empForm.hostRegion,
        daysUsed: Number(empForm.daysUsed),
        role: empForm.role,
        peRisk: empForm.peRisk,
        rule: { visaLimitDays: Number(empForm.visaLimitDays) },
        ssInfo: { form: empForm.form },
        recommendation: empForm.recommendation
      } : item));
    } else {
      const newEmployee = {
        id: Date.now().toString(),
        name: empForm.name,
        homeCountry: empForm.homeCountry,
        hostCountry: empForm.hostCountry,
        hostRegion: empForm.hostRegion,
        daysUsed: Number(empForm.daysUsed),
        role: empForm.role,
        peRisk: empForm.peRisk,
        rule: { visaLimitDays: Number(empForm.visaLimitDays) },
        ssInfo: { form: empForm.form },
        recommendation: empForm.recommendation
      };
      setEmployees(prev => [newEmployee, ...prev]);
    }

    setShowAddModal(false);
    setEditingEmpId(null);
  };

  const handleDeleteEmployee = (id) => {
    if (confirm('Are you sure you want to remove this employee from active compliance tracking?')) {
      setEmployees((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-indigo-950 text-white border-b border-indigo-900 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg shadow-inner">
              O
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">OrbitalHR</span>
              <span className="text-[10px] bg-indigo-800/80 text-indigo-200 px-2 py-0.5 rounded-full ml-2 font-medium">Enterprise SaaS</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-indigo-300 hidden sm:inline">Cross-Border Compliance & Tax Scoring</span>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Remote Roster</span>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{employees.length} Employees</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">100% compliant documentation</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>PE Risk Alerts</span>
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {employees.filter(e => e.peRisk === 'HIGH').length} High Risk
            </div>
            <div className="text-xs text-rose-600 mt-1 font-medium">Requires immediate mitigation</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Social Security Coverage</span>
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">100% Valid</div>
            <div className="text-xs text-slate-500 mt-1">A1 & Totalization active</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>EOR Graduation Ready</span>
              <Globe className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {employees.filter(e => e.peRisk === 'HIGH' || e.daysUsed > 120).length} Candidates
            </div>
            <div className="text-xs text-indigo-600 mt-1 font-medium">Cost optimization flagged</div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, role, or host country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-medium">Filter Risk:</span>
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>
        </div>

        {/* Employee Roster Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Active Remote Employee Roster</h2>
              <p className="text-xs text-slate-500">Monitoring day counts, tax permanent establishment risks, and social security compliance.</p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
              {filteredEmployees.length} Showing
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3">Employee / Role</th>
                  <th className="px-6 py-3">Host Region</th>
                  <th className="px-6 py-3">Visa Days Used</th>
                  <th className="px-6 py-3">PE Tax Risk</th>
                  <th className="px-6 py-3">Social Security</th>
                  <th className="px-6 py-3">Recommendation</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      No employees found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm">{emp.name}</div>
                        <div className="text-slate-500">{emp.homeCountry} · {emp.role}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{emp.hostRegion}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {emp.daysUsed} / {emp.rule?.visaLimitDays || 183}d
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          emp.peRisk === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          emp.peRisk === 'MODERATE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {emp.peRisk}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{emp.ssInfo?.form}</td>
                      <td className="px-6 py-4 font-medium text-indigo-700">{emp.recommendation}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(emp)} 
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition" 
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
