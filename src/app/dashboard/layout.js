import { requireSession } from '@/lib/auth-guard';
import { getAccessibleDepartments } from '@/lib/roles';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({ children }) {
  const session = await requireSession();
  const departments = getAccessibleDepartments(session.role);

  return (
    <div className="flex-1 min-h-screen bg-studio-black text-warm-cream flex flex-col font-sans selection:bg-burnt-sienna selection:text-studio-black">
      <DashboardNav user={session} departments={departments} />
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col gap-8">
        {children}
      </main>
    </div>
  );
}
