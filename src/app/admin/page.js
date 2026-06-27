import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth-guard';
import { listEmployees } from '@/lib/db';
import AdminPanelClient from './AdminPanelClient';

export default async function AdminPanelPage() {
  const session = await requireSession();

  // Admin panel (employee creation, role assignment, removal) is restricted
  // to the org's Super Admin. Anyone else is sent back to their dashboard.
  if (session.role !== 'super_admin') {
    redirect('/dashboard');
  }

  const employees = await listEmployees(session.organization_id);

  return <AdminPanelClient user={session} initialEmployees={employees} />;
}
