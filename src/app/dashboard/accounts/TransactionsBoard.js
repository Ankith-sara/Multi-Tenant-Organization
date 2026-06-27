'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function TransactionsBoard({ initialTransactions }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Unpaid');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    if (!clientName) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/accounts/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, amount, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add transaction.');
      setTransactions((prev) => [data.transaction, ...prev]);
      setClientName('');
      setAmount('');
      setStatus('Unpaid');
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
              <th className="py-3 px-4">Client / Payer</th>
              <th className="py-3 px-4">Invoice Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cork-shadow/40 text-sm">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                <td className="py-4 px-4 text-warm-cream font-medium">{t.client_name}</td>
                <td className="py-4 px-4 text-grey-brown">
                  {new Date(t.txn_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="py-4 px-4 text-warm-cream font-medium">${Number(t.amount).toLocaleString()}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    t.status === 'Paid'
                      ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                      : 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-grey-brown text-sm">
                  No transactions yet. Add your first invoice.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow lg:col-span-1">
        <h3 className="text-sm font-medium mb-4 text-warm-cream">Add New Invoice</h3>
        {error && (
          <div className="mb-4 p-3 border border-burnt-sienna/30 text-burnt-sienna bg-burnt-sienna/5 text-xs">
            {error}
          </div>
        )}
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Client / Payer
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Stark Industries"
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="120000"
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-2.5 bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[22.5px] text-xs font-semibold cursor-pointer transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Invoice'}
          </button>
        </form>
      </div>
    </div>
  );
}
