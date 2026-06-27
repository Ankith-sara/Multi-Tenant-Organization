import { getSession } from '@/lib/session';
import LandingNav from '@/components/LandingNav';
import Link from 'next/link';

export default async function LandingPage() {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-studio-black text-warm-cream font-sans selection:bg-burnt-sienna selection:text-studio-black relative">
      <LandingNav isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <section id="intro" className="relative w-full h-screen flex items-end">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-80 mix-blend-luminosity bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero_worktop.png)' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-studio-black via-transparent to-transparent opacity-90" />

        <div className="relative z-10 w-full px-6 md:px-12 pb-16 md:pb-24 flex flex-col md:flex-row justify-between items-end gap-12">
          {/* Headline - Bottom Left */}
          <div className="w-full md:w-1/2">
            <h1 className="text-[41px] md:text-[51px] font-medium leading-[0.9] tracking-normal mb-6">
              ORGWARE IS A DARK STUDIO PRODUCTION.
            </h1>
            <div className="flex gap-4">
              <Link href="/signup" className="px-6 py-[14.4px] rounded-[36px] bg-dark-cork text-warm-cream font-normal text-[14px] uppercase tracking-wider border border-transparent hover:border-warm-cream transition-colors">
                Start Building
              </Link>
              <Link href="/login" className="px-4 py-[7.5px] rounded-[22.5px] bg-transparent text-warm-cream border border-warm-cream font-normal text-[12px] uppercase tracking-wider hover:border-burnt-sienna transition-colors flex items-center justify-center">
                Sign In
              </Link>
            </div>
          </div>
          
          {/* Body Copy - Center Right */}
          <div className="w-full md:w-1/3 max-w-md pb-4">
            <p className="text-[18px] font-normal leading-[1.2] text-warm-cream">
              An architecture built on pure isolation. One tenant. One schema. Zero data leakage. Structured for the way complex teams actually work.
            </p>
          </div>
        </div>

        {/* Vertical Rotated Label */}
        <div className="absolute top-1/2 right-6 -translate-y-1/2 rotate-90 origin-right text-[10px] uppercase tracking-widest font-normal text-grey-brown hidden md:block">
          ORGWARE-1 ENGINE
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative w-full min-h-screen py-32 flex flex-col items-center justify-center">
        {/* Product Render Floating */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
          <img 
            src="/product_coaster.png" 
            alt="Floating Cork Coaster" 
            className="w-full max-w-4xl object-contain mix-blend-screen"
          />
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-[41px] font-medium leading-[1] mb-8">
              MULTI-TENANT<br/>BY DESIGN.
            </h2>
            <div className="w-full h-[1px] border-b border-dashed border-cork-shadow mb-8" />
            <p className="text-[14px] font-normal leading-[1.33] max-w-sm">
              We strip away the noise. Your organization gets its own dedicated database schema. No shared tables. No accidental cross-tenant queries. Security at the architectural level.
            </p>
          </div>
          
          <div className="w-full md:w-1/3 pt-12 md:pt-32">
             <div className="space-y-12">
               <div>
                 <h3 className="text-[18px] font-medium leading-[1.2] mb-3">Role-Based Access</h3>
                 <p className="text-[14px] text-grey-brown leading-[1.33]">
                   Granular control over every department. CRM, HR, Operations, and Accounts — securely partitioned.
                 </p>
               </div>
               <div>
                 <h3 className="text-[18px] font-medium leading-[1.2] mb-3">Cinematic Layouts</h3>
                 <p className="text-[14px] text-grey-brown leading-[1.33]">
                   A UI that gets out of your way. Sparse, architectural components outlined in cream on a dark canvas.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="relative w-full py-32 border-t border-dashed border-cork-shadow">
        <div className="w-full px-6 md:px-12">
           <h2 className="text-[29px] font-medium leading-[1.09] mb-12">DEPARTMENTS</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
             {['CRM', 'Human Resources', 'Operations', 'Properties', 'Accounts'].map((dept, i) => (
               <div key={dept} className="flex flex-col border-l border-cork-shadow pl-6">
                 <span className="text-[10px] text-burnt-sienna uppercase tracking-widest font-normal mb-2">MODULE 0{i + 1}</span>
                 <h4 className="text-[18px] font-medium leading-[1.2] mb-4">{dept}</h4>
                 <p className="text-[14px] text-grey-brown leading-[1.33]">
                   Dedicated pipelines and workflows specific to your organization's {dept.toLowerCase()} needs. 
                 </p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative w-full py-32 border-t border-dashed border-cork-shadow bg-studio-black">
        <div className="w-full px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-[41px] font-medium leading-[1] mb-6">READY TO<br/>INITIALIZE.</h2>
            <p className="text-[18px] font-normal leading-[1.2] max-w-sm mb-8">
              Join the beta program. Enter your credentials to request an isolated workspace.
            </p>
          </div>
          
          <div className="w-full md:w-1/3">
             <form className="flex flex-col gap-8">
               <input 
                 type="text" 
                 placeholder="ORGANIZATION NAME" 
                 className="w-full bg-transparent border-b border-warm-cream rounded-none text-[15px] font-normal py-[1px] pl-[2px] pr-[36px] placeholder-warm-cream/40 focus:outline-none focus:border-burnt-sienna transition-colors"
               />
               <input 
                 type="email" 
                 placeholder="ADMIN EMAIL" 
                 className="w-full bg-transparent border-b border-warm-cream rounded-none text-[15px] font-normal py-[1px] pl-[2px] pr-[36px] placeholder-warm-cream/40 focus:outline-none focus:border-burnt-sienna transition-colors"
               />
               <button type="button" className="self-start text-[14px] font-normal uppercase tracking-wider text-warm-cream border-b border-warm-cream pb-1 hover:text-burnt-sienna hover:border-burnt-sienna transition-colors">
                 Submit Request
               </button>
             </form>
          </div>
        </div>
      </section>

    </div>
  );
}
