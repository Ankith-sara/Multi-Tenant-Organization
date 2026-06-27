import { Building } from 'lucide-react';
import { requireDepartmentAccess } from '@/lib/auth-guard';
import { ensureDepartmentTables, listProperties } from '@/lib/db';
import PropertyBoard from './PropertyBoard';

export default async function PropertyPage() {
  const session = await requireDepartmentAccess('property');
  await ensureDepartmentTables(session.organization_id);
  const properties = await listProperties(session.organization_id);

  const occupiedCount = properties.filter((p) => p.status === 'Occupied').length;
  const occupancyRate = properties.length > 0
    ? ((occupiedCount / properties.length) * 100).toFixed(1)
    : '0.0';
  const totalValue = properties.reduce((sum, p) => sum + Number(p.rent), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Total Listings</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{properties.length}</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Occupancy Rate</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none text-burnt-sienna">{occupancyRate}%</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Total Monthly Rent</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">${totalValue.toLocaleString()}</div>
        </div>
      </div>

      <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
        <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
          <Building className="w-5 h-5 text-burnt-sienna" />
          Managed Real Estate Listings
        </h2>
        <PropertyBoard initialProperties={properties} />
      </div>
    </div>
  );
}
