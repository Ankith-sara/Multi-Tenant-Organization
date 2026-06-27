import { requireDepartmentAccess } from '@/lib/auth-guard';
import { ensureDepartmentTables, listOpsTasks } from '@/lib/db';
import OpsTaskBoard from './OpsTaskBoard';

export default async function OperationsPage() {
  const session = await requireDepartmentAccess('operations');
  await ensureDepartmentTables(session.organization_id);
  const tasks = await listOpsTasks(session.organization_id);

  const queuedCount = tasks.filter((t) => t.status === 'Queued').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Active Server Cluster</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">3 nodes</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Scheduled Queued Tasks</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{queuedCount}</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Uptime Status</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none text-burnt-sienna">99.98%</div>
        </div>
      </div>

      <OpsTaskBoard initialTasks={tasks} />
    </div>
  );
}
