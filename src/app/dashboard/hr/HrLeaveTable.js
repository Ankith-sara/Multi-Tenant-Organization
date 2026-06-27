'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

export default function HrLeaveTable({ initialLeaves, canReview }) {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [updatingId, setUpdatingId] = useState(null);

  const handleReview = async (leaveId, status) => {
    setUpdatingId(leaveId);
    try {
      const res = await fetch('/api/hr/leaves', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update leave request.');
        return;
      }
      setLeaves((prev) => prev.map((l) => (l.id === leaveId ? { ...l, status } : l)));
    } catch (err) {
      console.error('Error updating leave request:', err);
      alert('An error occurred while updating the leave request.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (leaves.length === 0) {
    return <p className="text-grey-brown text-sm py-6 text-center">No leave requests yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
            {canReview && <th className="py-3 px-4">Employee</th>}
            <th className="py-3 px-4">Leave Type</th>
            <th className="py-3 px-4">Schedule Dates</th>
            <th className="py-3 px-4">Status</th>
            {canReview && <th className="py-3 px-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-cork-shadow/40 text-sm">
          {leaves.map((leave) => (
            <tr key={leave.id} className="hover:bg-warm-cream/[0.02] transition-colors">
              {canReview && (
                <td className="py-4 px-4 text-warm-cream font-medium">{leave.employee_email}</td>
              )}
              <td className="py-4 px-4 text-grey-brown">{leave.leave_type}</td>
              <td className="py-4 px-4 text-warm-cream font-medium">
                {new Date(leave.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {' – '}
                {new Date(leave.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  leave.status === 'Approved'
                    ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                    : leave.status === 'Rejected'
                    ? 'bg-transparent border-cork-shadow text-grey-brown opacity-60'
                    : 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream'
                }`}>
                  {leave.status}
                </span>
              </td>
              {canReview && (
                <td className="py-4 px-4 text-right">
                  {updatingId === leave.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-burnt-sienna inline-block" />
                  ) : leave.status === 'Pending' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleReview(leave.id, 'Approved')}
                        className="p-1 rounded-full border border-warm-cream hover:border-burnt-sienna text-warm-cream transition-all duration-200 cursor-pointer"
                        title="Approve Leave"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReview(leave.id, 'Rejected')}
                        className="p-1 rounded-full border border-cork-shadow hover:border-burnt-sienna text-grey-brown hover:text-warm-cream transition-all duration-200 cursor-pointer"
                        title="Reject Leave"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-grey-brown italic">Completed</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
