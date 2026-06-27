'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Building, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/app/ThemeToggle';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organization_id: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'organization_id') {
      const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { organization_id, email, password, confirmPassword } = formData;

    if (!organization_id || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-studio-black text-warm-cream flex items-center justify-center p-6 font-sans selection:bg-burnt-sienna selection:text-studio-black relative">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md z-10">
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-2.5 group mb-3">
            <div className="text-burnt-sienna p-1">
              <Shield className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="font-semibold text-[24px] tracking-tight text-warm-cream">
              OrgWare
            </span>
          </Link>
          <h2 className="text-[18px] font-medium text-warm-cream mt-2">Create your Organization</h2>
          <p className="text-grey-brown text-[12px] mt-1">Set up isolated environment & account</p>
        </div>

        {/* Signup Form Container */}
        <div className="border border-dashed border-cork-shadow rounded-[12px] p-8">
          {error && (
            <div className="mb-6 p-4 border border-burnt-sienna/30 text-burnt-sienna bg-burnt-sienna/5 text-[14px] leading-[1.33]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization ID */}
            <div>
              <label htmlFor="organization_id" className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
                Organization ID
              </label>
              <div className="relative">
                <Building className="absolute left-0 top-1/2 -translate-y-1/2 w-4 text-grey-brown" />
                <input
                  type="text"
                  name="organization_id"
                  id="organization_id"
                  value={formData.organization_id}
                  onChange={handleChange}
                  placeholder="e.g. google, acme_corp"
                  required
                  className="w-full bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-[15px] pl-7 pr-2 py-2 transition-colors duration-300"
                />
              </div>
              <p className="text-[10px] text-grey-brown mt-2 ml-0.5">
                Alphanumeric characters and underscores only. This dictates your isolated database namespace.
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 text-grey-brown" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-[15px] pl-7 pr-2 py-2 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 text-grey-brown" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-[15px] pl-7 pr-10 py-2 transition-colors duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-grey-brown hover:text-warm-cream focus:outline-none p-1 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 text-grey-brown" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-[15px] pl-7 pr-10 py-2 transition-colors duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-grey-brown hover:text-warm-cream focus:outline-none p-1 transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[36px] font-medium text-[14px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Tenant Database...
                </>
              ) : (
                <>
                  Register & Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-grey-brown text-[12px] mt-8">
          Already registered?{' '}
          <Link href="/login" className="text-warm-cream hover:underline hover:decoration-burnt-sienna transition-colors font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
