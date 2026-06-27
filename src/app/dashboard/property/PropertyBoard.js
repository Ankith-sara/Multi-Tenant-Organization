'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PropertyBoard({ initialProperties }) {
  const [properties, setProperties] = useState(initialProperties);
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [rent, setRent] = useState('');
  const [status, setStatus] = useState('Vacant');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setError('');
    if (!name) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/property/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, propertyType, rent, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add property.');
      setProperties((prev) => [data.property, ...prev]);
      setName('');
      setRent('');
      setStatus('Vacant');
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
              <th className="py-3 px-4">Property Asset</th>
              <th className="py-3 px-4">Asset Type</th>
              <th className="py-3 px-4">Monthly Rent</th>
              <th className="py-3 px-4">Listing Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cork-shadow/40 text-sm">
            {properties.map((prop) => (
              <tr key={prop.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                <td className="py-4 px-4 text-warm-cream font-medium">{prop.name}</td>
                <td className="py-4 px-4 text-grey-brown">{prop.property_type}</td>
                <td className="py-4 px-4 text-warm-cream font-medium">${Number(prop.rent).toLocaleString()}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    prop.status === 'Occupied'
                      ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                      : 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream'
                  }`}>
                    {prop.status}
                  </span>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-grey-brown text-sm">
                  No listings yet. Add your first property.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow lg:col-span-1">
        <h3 className="text-sm font-medium mb-4 text-warm-cream">Add New Property</h3>
        {error && (
          <div className="mb-4 p-3 border border-burnt-sienna/30 text-burnt-sienna bg-burnt-sienna/5 text-xs">
            {error}
          </div>
        )}
        <form onSubmit={handleAddProperty} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Property Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sienna Studio Loft 4B"
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Asset Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Monthly Rent ($)
            </label>
            <input
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="3200"
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
              Listing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
            >
              <option value="Vacant">Vacant</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-2.5 bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[22.5px] text-xs font-semibold cursor-pointer transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
