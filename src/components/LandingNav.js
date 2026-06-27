'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingNav({ isLoggedIn }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${scrolled ? 'bg-studio-black border-b border-cork-shadow' : 'bg-transparent border-transparent'}`}>
      <div className="w-full px-6 py-4 flex justify-between items-center">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-[15px] leading-none text-warm-cream tracking-tight">OrgWare</span>
        </div>

        {/* Right: Nav Links */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 items-center">
            {['INTRO', 'FEATURES', 'PRODUCT', 'CONTACT'].map((item, idx) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[12px] font-normal text-warm-cream hover:text-burnt-sienna transition-colors tracking-widest uppercase"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {item}
              </a>
            ))}
          </div>
          
          <div className="w-[1px] h-4 bg-cork-shadow hidden md:block" />

          {isLoggedIn ? (
            <Link 
              href="/dashboard"
              className="px-4 py-2 rounded-[22.5px] border border-warm-cream text-warm-cream hover:border-burnt-sienna hover:text-burnt-sienna text-[12px] font-normal transition-colors"
            >
              GO TO DASHBOARD
            </Link>
          ) : (
            <div className="flex gap-4 items-center">
              <Link 
                href="/login"
                className="text-[12px] font-normal text-warm-cream hover:text-burnt-sienna transition-colors uppercase tracking-widest"
              >
                Login
              </Link>
              <Link 
                href="/signup"
                className="px-4 py-2 rounded-[36px] bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream text-[14px] font-normal transition-colors uppercase tracking-widest"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
