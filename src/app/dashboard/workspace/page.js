import { Users, Shield, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { requireDepartmentAccess } from '@/lib/auth-guard';
import { listEmployees } from '@/lib/db';
import { getRoleDetails } from '@/lib/roles';

export default async function WorkspacePage() {
  const session = await requireDepartmentAccess('workspace');
  const employees = await listEmployees(session.organization_id);
  const isSuperAdmin = session.role === 'super_admin';

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-[12px] border border-dashed border-cork-shadow">
        <div>
          <span className="text-burnt-sienna text-[10px] font-semibold uppercase tracking-wider">
            System Dashboard
          </span>
          <h1 className="text-[29px] font-medium tracking-tight mt-1 mb-2 leading-none">
            {session.email}
          </h1>
          <p className="text-grey-brown text-sm font-light">
            You are logged into <span className="text-warm-cream font-medium capitalize">{session.display_name || session.organization_id}</span>&apos;s network workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-grey-brown">Active Role:</span>
          {(() => {
            const details = getRoleDetails(session.role);
            return (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${details.classes}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${details.dotClass}`} />
                {details.label}
              </span>
            );
          })()}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="p-6 rounded-[12px] border border-dashed border-burnt-sienna/30 bg-burnt-sienna/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="text-burnt-sienna p-1">
              <Shield className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-medium text-[18px] text-warm-cream">Super Admin Control Center</h3>
              <p className="text-grey-brown text-sm mt-0.5 leading-relaxed">
                As the first employee of {session.display_name || session.organization_id}, you hold full super-admin access. You can add new members and configure their authorization levels.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="w-full md:w-auto px-6 py-3.5 rounded-[36px] bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 shrink-0"
          >
            Open Admin Panel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-burnt-sienna" />
          <h2 className="text-[18px] font-medium">Workspace Directory</h2>
          <span className="px-2 py-0.5 rounded border border-cork-shadow text-[10px] text-grey-brown font-semibold ml-2">
            {employees.length} members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
                <th className="py-4 px-4 font-semibold">Member Email</th>
                <th className="py-4 px-4 font-semibold">Authorization Role</th>
                <th className="py-4 px-4 hidden sm:table-cell font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cork-shadow/40 text-sm">
              {employees.map((emp) => {
                const isCurrent = emp.id === session.id;
                return (
                  <tr
                    key={emp.id}
                    className={`hover:bg-warm-cream/[0.02] transition-colors ${
                      isCurrent ? 'bg-warm-cream/[0.01]' : ''
                    }`}
                  >
                    <td className="py-4 px-4 font-medium flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border border-cork-shadow flex items-center justify-center text-warm-cream font-semibold text-xs bg-transparent">
                        {emp.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-warm-cream">
                          {emp.email}
                          {isCurrent && (
                            <span className="ml-2 text-[10px] border border-burnt-sienna/20 bg-burnt-sienna/5 text-burnt-sienna px-2 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {(() => {
                        const details = getRoleDetails(emp.role);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${details.classes}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${details.dotClass}`} />
                            {details.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 text-grey-brown hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-grey-brown stroke-[1.5]" />
                        {new Date(emp.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
