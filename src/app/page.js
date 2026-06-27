import Link from 'next/link';
import { Shield, Database, Users, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/app/ThemeToggle';

export default function Home() {
  return (
    <div className="flex-1 bg-studio-black text-warm-cream flex flex-col justify-between overflow-x-hidden min-h-screen font-sans selection:bg-burnt-sienna selection:text-studio-black">
      
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5">
          <div className="text-burnt-sienna p-1">
            <Shield className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="font-sans font-semibold text-[24px] tracking-tight text-warm-cream">
            OrgWare
          </span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link 
            href="/login" 
            className="text-[14px] font-normal text-warm-cream hover:underline hover:decoration-burnt-sienna hover:decoration-2 transition-all duration-200"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-2.5 text-[12px] font-normal bg-transparent text-warm-cream border border-warm-cream rounded-[22.5px] hover:border-burnt-sienna transition-all duration-300"
          >
            Register Org
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto w-full px-6 py-16 md:py-28 flex-1 flex flex-col items-center justify-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-burnt-sienna text-burnt-sienna text-[10px] font-medium uppercase tracking-wider mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-burnt-sienna" />
          Multi-Tenant Isolation Ready
        </div>

        <h1 className="font-sans font-medium text-[41px] sm:text-[51px] leading-[0.95] tracking-tight mb-8 max-w-4xl text-warm-cream">
          Secure, Dynamic Database Partitioning for Teams
        </h1>
        
        <p className="text-grey-brown text-[14px] md:text-[18px] max-w-2xl mb-12 leading-[1.33] font-light">
          Create completely isolated PostgreSQL schemas for your clients dynamically. Authenticate team members safely within tenant scopes and manage roles securely.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-24">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-4 rounded-[36px] bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream font-medium text-[14px] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Get Started
            <ArrowRight className="w-4 h-4 text-warm-cream group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 rounded-[22.5px] bg-transparent border border-warm-cream text-warm-cream font-medium text-[14px] hover:border-burnt-sienna transition-all duration-300 flex items-center justify-center"
          >
            Access Organization
          </Link>
        </div>

        {/* Dashed separator */}
        <div className="w-full border-t border-dashed border-cork-shadow mb-16" />

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow transition-all duration-300 hover:border-warm-cream group">
            <div className="text-burnt-sienna mb-6">
              <Database className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-medium text-[18px] text-warm-cream mb-2">Isolated Client DBs</h3>
            <p className="text-grey-brown text-[14px] leading-[1.33]">
              Dynamically provisions unique PostgreSQL schemas on Neon based on your Organization ID. Absolute scope isolation.
            </p>
          </div>

          <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow transition-all duration-300 hover:border-warm-cream group">
            <div className="text-burnt-sienna mb-6">
              <Shield className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-medium text-[18px] text-warm-cream mb-2">Secure Scoped Logins</h3>
            <p className="text-grey-brown text-[14px] leading-[1.33]">
              Users log in strictly from their tenant’s employee database. No master login leaks, completely independent sessions.
            </p>
          </div>

          <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow transition-all duration-300 hover:border-warm-cream group">
            <div className="text-burnt-sienna mb-6">
              <Users className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-medium text-[18px] text-warm-cream mb-2">Super Admin Controls</h3>
            <p className="text-grey-brown text-[14px] leading-[1.33]">
              The first employee of each organization is assigned Super Admin permissions to invite employees and assign custom roles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-10 border-t border-dashed border-cork-shadow mt-16 flex flex-col sm:flex-row justify-between items-center text-grey-brown text-[10px] gap-4 z-10">
        <div>
          &copy; {new Date().getFullYear()} OrgWare Inc. All rights reserved.
        </div>
        <div className="flex gap-6">
          <span className="hover:text-warm-cream cursor-pointer transition-colors">Security</span>
          <span className="hover:text-warm-cream cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-warm-cream cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
