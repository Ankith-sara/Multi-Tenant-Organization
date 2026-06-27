import { Briefcase } from 'lucide-react';
import { requireDepartmentAccess } from '@/lib/auth-guard';
import { ensureDepartmentTables, listHrLeaveRequests, listHrLeaveRequestsForEmployee, listEmployees } from '@/lib/db';
import { isManagerRole } from '@/lib/roles';
import HrLeaveTable from './HrLeaveTable';
import HrLeaveRequestForm from './HrLeaveRequestForm';

export default async function HrPage() {
  const session = await requireDepartmentAccess('hr');
  await ensureDepartmentTables(session.organization_id);
  const manager = isManagerRole(session.role);

  const [leaves, employees] = await Promise.all([
    manager
      ? listHrLeaveRequests(session.organization_id)
      : listHrLeaveRequestsForEmployee(session.organization_id, session.id),
    listEmployees(session.organization_id),
  ]);

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Active Members</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{employees.length}</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Pending Leaves</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{pendingCount}</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Total Requests</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{leaves.length}</div>
        </div>
      </div>

      {!manager && (
        <HrLeaveRequestForm />
      )}

      <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
        <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-burnt-sienna" />
          {manager ? 'Employee Leave Requests Registry' : 'Your Leave Requests'}
        </h2>
        <HrLeaveTable initialLeaves={leaves} canReview={manager} />
      </div>
    </div>
  );
}
