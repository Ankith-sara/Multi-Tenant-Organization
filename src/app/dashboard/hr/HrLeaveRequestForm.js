'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Loader2 } from 'lucide-react';

export default function HrLeaveRequestForm() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState('Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!startDate || !endDate) {
      setError('Please choose a start and end date.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/hr/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveType, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit leave request.');
      }
      setStartDate('');
      setEndDate('');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow">
      <h2 className="text-[16px] font-medium mb-4 flex items-center gap-2">
        <CalendarPlus className="w-4 h-4 text-burnt-sienna" />
        Request Time Off
      </h2>

      {error && (
        <div className="mb-4 p-3 border border-burnt-sienna/30 text-burnt-sienna bg-burnt-sienna/5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
            Leave Type
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
          >
            <option value="Vacation">Vacation</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Personal">Personal</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="py-2.5 bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[22.5px] text-xs font-semibold cursor-pointer transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
