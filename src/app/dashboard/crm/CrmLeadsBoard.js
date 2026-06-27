'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function CrmLeadsBoard({ initialLeads }) {
  const [leads, setLeads] = useState(initialLeads);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('New');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddLead = async (e) => {
    e.preventDefault();
    setError('');
    if (!name) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, value, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add lead.');
      setLeads((prev) => [data.lead, ...prev]);
      setName('');
      setEmail('');
      setValue('');
      setStatus('New');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
              <th className="py-3 px-2">Account Name</th>
              <th className="py-3 px-2">Contact Email</th>
              <th className="py-3 px-2">Deal Size</th>
              <th className="py-3 px-2">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cork-shadow/40 text-sm">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                <td className="py-3 px-2 text-warm-cream font-medium">{lead.name}</td>
                <td className="py-3 px-2 text-grey-brown">{lead.email || '—'}</td>
                <td className="py-3 px-2 text-warm-cream font-semibold">
                  ${Number(lead.value).toLocaleString()}
                </td>
                <td className="py-3 px-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    lead.status === 'Won'
                      ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                      : lead.status === 'Proposal'
                      ? 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream'
                      : 'bg-transparent border-cork-shadow text-grey-brown'
                  }`}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-grey-brown text-sm">
                  No leads yet. Add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow lg:col-span-1">
        <h3 className="text-sm font-medium mb-4 text-warm-cream">Add New Lead</h3>
        {error && (
          <div className="mb-4 p-3 border border-burnt-sienna/30 text-burnt-sienna bg-burnt-sienna/5 text-xs">
            {error}
          </div>
        )}
        <form onSubmit={handleAddLead} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Account Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp Inc"
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="billing@acme.com"
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Deal Size ($)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="15000"
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Pipeline Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            >
              <option value="New">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Proposal">Proposal Submitted</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-2.5 bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[22.5px] text-xs font-semibold cursor-pointer transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Lead Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
