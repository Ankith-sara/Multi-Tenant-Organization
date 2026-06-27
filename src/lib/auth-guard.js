import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { canAccessDepartment } from '@/lib/roles';

// Call at the top of any server component page that requires a logged-in session.
// Redirects to /login if there is no session. Returns the session otherwise.
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

// Call at the top of any department page. Redirects to /login if unauthenticated,
// or to /dashboard if the user's role isn't permitted to view this department.
export async function requireDepartmentAccess(departmentKey) {
  const session = await requireSession();
  if (!canAccessDepartment(session.role, departmentKey)) {
    redirect('/dashboard');
  }
  return session;
}
