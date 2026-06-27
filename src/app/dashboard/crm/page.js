import { Layers } from 'lucide-react';
import { requireDepartmentAccess } from '@/lib/auth-guard';
import { ensureDepartmentTables, listCrmLeads } from '@/lib/db';
import CrmLeadsBoard from './CrmLeadsBoard';

export default async function CrmPage() {
  const session = await requireDepartmentAccess('crm');
  await ensureDepartmentTables(session.organization_id);
  const leads = await listCrmLeads(session.organization_id);

  const activeCount = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const wonCount = leads.filter((l) => l.status === 'Won').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Total CRM Leads</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{leads.length}</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Active Pipelines</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{activeCount}</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Deals Closed Won</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{wonCount}</div>
        </div>
      </div>

      <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
        <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-burnt-sienna" />
          Active Sales Pipeline
        </h2>
        <CrmLeadsBoard initialLeads={leads} />
      </div>
    </div>
  );
}
