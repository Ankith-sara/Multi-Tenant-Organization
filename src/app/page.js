import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth-guard';
import { getDefaultDepartment, DEPARTMENTS } from '@/lib/roles';

export default async function DashboardRoot() {
  const session = await requireSession();
  const defaultDept = getDefaultDepartment(session.role);
  redirect(DEPARTMENTS[defaultDept].path);
}
