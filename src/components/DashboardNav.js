'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shield, Building, LogOut, Loader2, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/app/ThemeToggle';
import { getRoleDetails } from '@/lib/roles';

export default function DashboardNav({ user, departments }) {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLogoutLoading(false);
    }
  };

  const roleDetails = getRoleDetails(user.role);
  const isSuperAdmin = user.role === 'super_admin';

  return (
    <>
      <nav className="w-full bg-studio-black border-b border-cork-shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-burnt-sienna p-1">
              <Shield className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-none">OrgWare</span>
              <span className="text-grey-brown text-[10px] uppercase font-semibold mt-0.5 tracking-wider">
                {roleDetails.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[22.5px] border border-cork-shadow text-xs text-grey-brown">
              <Building className="w-3.5 h-3.5 text-burnt-sienna" />
              <span>Org: <strong className="text-warm-cream capitalize">{user.display_name || user.organization_id}</strong></span>
            </div>

            {isSuperAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-[22.5px] bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream text-sm font-medium transition-all duration-300"
              >
                Admin Panel
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-[22.5px] bg-transparent border border-warm-cream text-warm-cream hover:border-burnt-sienna text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              {logoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4 stroke-[1.5]" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="w-full border-b border-cork-shadow bg-studio-black sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-8 overflow-x-auto">
          {departments.map((dept) => {
            const active = pathname === dept.path || pathname.startsWith(dept.path + '/');
            return (
              <Link
                key={dept.key}
                href={dept.path}
                className={`py-4 text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-all duration-300 shrink-0 ${
                  active
                    ? 'border-burnt-sienna text-warm-cream'
                    : 'border-transparent text-grey-brown hover:text-warm-cream'
                }`}
              >
                {dept.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
