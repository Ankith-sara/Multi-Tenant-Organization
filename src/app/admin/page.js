'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  UserPlus, 
  ArrowLeft, 
  Users, 
  Mail, 
  Lock, 
  UserCheck, 
  Loader2, 
  Check, 
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import ThemeToggle from '@/app/ThemeToggle';

export function getRoleDetails(role) {
  switch (role) {
    case 'super_admin':
      return { 
        label: 'Super Admin', 
        classes: 'bg-burnt-sienna/5 text-warm-cream border-burnt-sienna/30', 
        dotClass: 'bg-burnt-sienna' 
      };
    case 'admin':
      return { 
        label: 'General Admin', 
        classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/20', 
        dotClass: 'bg-warm-cream' 
      };
    case 'employee':
      return { 
        label: 'General Employee', 
        classes: 'bg-transparent text-grey-brown border-cork-shadow', 
        dotClass: 'bg-cork-shadow' 
      };
    
    // Property
    case 'property_manager':
      return { 
        label: 'Property Manager', 
        classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', 
        dotClass: 'bg-warm-cream' 
      };
    case 'property_associate':
      return { 
        label: 'Property Associate', 
        classes: 'bg-transparent text-grey-brown border-cork-shadow', 
        dotClass: 'bg-cork-shadow' 
      };
      
    // CRM
    case 'crm_manager':
      return { 
        label: 'CRM Manager', 
        classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', 
        dotClass: 'bg-warm-cream' 
      };
    case 'crm_agent':
      return { 
        label: 'CRM Agent', 
        classes: 'bg-transparent text-grey-brown border-cork-shadow', 
        dotClass: 'bg-cork-shadow' 
      };
      
    // Operations
    case 'operations_manager':
      return { 
        label: 'Operations Manager', 
        classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', 
        dotClass: 'bg-warm-cream' 
      };
    case 'operations_associate':
      return { 
        label: 'Operations Associate', 
        classes: 'bg-transparent text-grey-brown border-cork-shadow', 
        dotClass: 'bg-cork-shadow' 
      };
      
    // HR
    case 'hr_manager':
      return { 
        label: 'HR Manager', 
        classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', 
        dotClass: 'bg-warm-cream' 
      };
    case 'hr_specialist':
      return { 
        label: 'HR Specialist', 
        classes: 'bg-transparent text-grey-brown border-cork-shadow', 
        dotClass: 'bg-cork-shadow' 
      };
      
    // Accounts
    case 'finance_manager':
      return { 
        label: 'Finance Manager', 
        classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', 
        dotClass: 'bg-warm-cream' 
      };
    case 'accountant':
      return { 
        label: 'Accountant', 
        classes: 'bg-transparent text-grey-brown border-cork-shadow', 
        dotClass: 'bg-cork-shadow' 
      };
      
    default:
      return { 
        label: role ? role.replace('_', ' ').toUpperCase() : 'Unknown', 
        classes: 'bg-transparent text-grey-brown border-cork-shadow', 
        dotClass: 'bg-cork-shadow' 
      };
  }
}

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('employee');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Inline edit state
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function checkAuthAndFetchData() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        
        if (!meData.user) {
          router.push('/login');
          return;
        }

        if (meData.user.role !== 'super_admin') {
          // If not super admin, redirect to general dashboard
          router.push('/dashboard');
          return;
        }

        setUser(meData.user);

        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData.employees || []);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchData();
  }, [router]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setAddLoading(true);

    if (!newEmail || !newPassword || !newRole) {
      setFormError('All fields are required.');
      setAddLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add employee.');
      }

      setFormSuccess('Employee added successfully!');
      setNewEmail('');
      setNewPassword('');
      setNewRole('employee');

      // Refresh employee list
      const empRes = await fetch('/api/employees');
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.employees || []);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRoleChange = async (employeeId, role) => {
    setUpdatingId(employeeId);
    try {
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update role.');
        return;
      }

      // Update state locally
      setEmployees((prev) => 
        prev.map((emp) => emp.id === employeeId ? { ...emp, role } : emp)
      );
    } catch (err) {
      console.error('Error updating role:', err);
      alert('An error occurred while updating role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteEmployee = async (employeeId, email) => {
    if (!confirm(`Are you sure you want to remove ${email} from the organization?`)) {
      return;
    }

    setUpdatingId(employeeId);
    try {
      const res = await fetch(`/api/employees?id=${employeeId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to remove employee.');
        return;
      }

      // Update state locally
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    } catch (err) {
      console.error('Error removing employee:', err);
      alert('An error occurred while removing employee.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-studio-black flex flex-col items-center justify-center text-warm-cream">
        <Loader2 className="w-10 h-10 animate-spin text-burnt-sienna mb-4" />
        <p className="text-grey-brown text-sm">Authenticating Admin Access...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 min-h-screen bg-studio-black text-warm-cream flex flex-col font-sans selection:bg-burnt-sienna selection:text-studio-black">
      {/* Top Navbar */}
      <nav className="w-full bg-studio-black border-b border-cork-shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-full border border-transparent hover:border-cork-shadow transition-colors text-grey-brown hover:text-warm-cream mr-1">
              <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="text-burnt-sienna p-1">
                <Shield className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg leading-none">Super Admin Panel</span>
                <span className="text-grey-brown text-[10px] uppercase font-semibold mt-0.5 tracking-wider">
                  Organization: <strong className="text-warm-cream capitalize">{user.display_name || user.organization_id}</strong>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-[22.5px] bg-transparent border border-warm-cream text-warm-cream hover:border-burnt-sienna text-sm font-medium transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create User Form */}
        <div className="lg:col-span-1">
          <div className="border border-dashed border-cork-shadow rounded-[12px] p-6 sticky top-24">
            <div className="flex items-center gap-2.5 mb-6">
              <UserPlus className="w-5 h-5 text-burnt-sienna" />
              <h2 className="text-[18px] font-medium text-warm-cream">Add New Employee</h2>
            </div>

            {formError && (
              <div className="mb-4 p-4 border border-burnt-sienna/30 text-burnt-sienna bg-burnt-sienna/5 text-[14px]">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-4 border border-warm-cream/20 text-warm-cream bg-warm-cream/5 text-[14px] flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-warm-cream" />
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 text-grey-brown" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="employee@company.com"
                    required
                    className="w-full bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-[15px] pl-7 pr-2 py-2 transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
                  Default Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 text-grey-brown" />
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-[15px] pl-7 pr-10 py-2 transition-colors duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-grey-brown hover:text-warm-cream focus:outline-none p-1 transition-colors duration-300"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1.5">
                  Authorization Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-studio-black border border-cork-shadow focus:border-warm-cream rounded-none text-warm-cream outline-none text-sm cursor-pointer transition-colors"
                >
                  <optgroup label="Core Roles" className="bg-studio-black text-grey-brown font-semibold">
                    <option value="employee" className="text-warm-cream bg-studio-black">General Employee</option>
                    <option value="admin" className="text-warm-cream bg-studio-black">General Admin</option>
                  </optgroup>
                  <optgroup label="Property Department" className="bg-studio-black text-grey-brown font-semibold">
                    <option value="property_manager" className="text-warm-cream bg-studio-black">Property Manager</option>
                    <option value="property_associate" className="text-warm-cream bg-studio-black">Property Associate</option>
                  </optgroup>
                  <optgroup label="CRM Department" className="bg-studio-black text-grey-brown font-semibold">
                    <option value="crm_manager" className="text-warm-cream bg-studio-black">CRM Manager</option>
                    <option value="crm_agent" className="text-warm-cream bg-studio-black">CRM Agent</option>
                  </optgroup>
                  <optgroup label="Operations Department" className="bg-studio-black text-grey-brown font-semibold">
                    <option value="operations_manager" className="text-warm-cream bg-studio-black">Operations Manager</option>
                    <option value="operations_associate" className="text-warm-cream bg-studio-black">Operations Associate</option>
                  </optgroup>
                  <optgroup label="HR Department" className="bg-studio-black text-grey-brown font-semibold">
                    <option value="hr_manager" className="text-warm-cream bg-studio-black">HR Manager</option>
                    <option value="hr_specialist" className="text-warm-cream bg-studio-black">HR Specialist</option>
                  </optgroup>
                  <optgroup label="Accounts Department" className="bg-studio-black text-grey-brown font-semibold">
                    <option value="finance_manager" className="text-warm-cream bg-studio-black">Finance Manager</option>
                    <option value="accountant" className="text-warm-cream bg-studio-black">Accountant</option>
                  </optgroup>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={addLoading}
                className="w-full mt-2 py-4 px-4 bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[36px] font-medium text-[14px] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {addLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Employee...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add Employee
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Employee Roles Table */}
        <div className="lg:col-span-2">
          <div className="border border-dashed border-cork-shadow rounded-[12px] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-burnt-sienna" />
              <h2 className="text-[18px] font-medium text-warm-cream">Manage Employee Roles</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
                    <th className="py-4 px-4 font-semibold">Employee</th>
                    <th className="py-4 px-4 font-semibold">Current Role</th>
                    <th className="py-4 px-4 text-right font-semibold">Assign Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cork-shadow/40 text-sm">
                  {employees.map((emp) => {
                    const isSelf = emp.id === user.id;
                    return (
                      <tr key={emp.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                        <td className="py-4 px-4 font-medium flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-cork-shadow flex items-center justify-center text-warm-cream font-bold text-xs bg-transparent">
                            {emp.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-warm-cream">
                              {emp.email}
                              {isSelf && (
                                <span className="ml-2 text-[10px] border border-burnt-sienna/25 bg-burnt-sienna/5 text-burnt-sienna px-2 py-0.5 rounded-full font-medium">
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
                        <td className="py-4 px-4 text-right">
                          {isSelf ? (
                            <span className="text-grey-brown text-xs italic flex items-center justify-end gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-grey-brown" />
                              System Owner
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              {updatingId === emp.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-burnt-sienna" />
                              ) : (
                                <>
                                  <select
                                    value={emp.role}
                                    onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                                    className="px-2 py-1.5 bg-studio-black border border-cork-shadow focus:border-warm-cream rounded-none text-warm-cream text-xs outline-none cursor-pointer transition-colors"
                                  >
                                    <optgroup label="Core Roles" className="bg-studio-black text-grey-brown font-semibold">
                                      <option value="employee" className="text-warm-cream bg-studio-black">General Employee</option>
                                      <option value="admin" className="text-warm-cream bg-studio-black">General Admin</option>
                                      <option value="super_admin" className="text-warm-cream bg-studio-black">Super Admin</option>
                                    </optgroup>
                                    <optgroup label="Property Department" className="bg-studio-black text-grey-brown font-semibold">
                                      <option value="property_manager" className="text-warm-cream bg-studio-black">Property Manager</option>
                                      <option value="property_associate" className="text-warm-cream bg-studio-black">Property Associate</option>
                                    </optgroup>
                                    <optgroup label="CRM Department" className="bg-studio-black text-grey-brown font-semibold">
                                      <option value="crm_manager" className="text-warm-cream bg-studio-black">CRM Manager</option>
                                      <option value="crm_agent" className="text-warm-cream bg-studio-black">CRM Agent</option>
                                    </optgroup>
                                    <optgroup label="Operations Department" className="bg-studio-black text-grey-brown font-semibold">
                                      <option value="operations_manager" className="text-warm-cream bg-studio-black">Operations Manager</option>
                                      <option value="operations_associate" className="text-warm-cream bg-studio-black">Operations Associate</option>
                                    </optgroup>
                                    <optgroup label="HR Department" className="bg-studio-black text-grey-brown font-semibold">
                                      <option value="hr_manager" className="text-warm-cream bg-studio-black">HR Manager</option>
                                      <option value="hr_specialist" className="text-warm-cream bg-studio-black">HR Specialist</option>
                                    </optgroup>
                                    <optgroup label="Accounts Department" className="bg-studio-black text-grey-brown font-semibold">
                                      <option value="finance_manager" className="text-warm-cream bg-studio-black">Finance Manager</option>
                                      <option value="accountant" className="text-warm-cream bg-studio-black">Accountant</option>
                                    </optgroup>
                                  </select>
                                  <button
                                    onClick={() => handleDeleteEmployee(emp.id, emp.email)}
                                    className="p-1.5 text-grey-brown hover:text-burnt-sienna hover:bg-burnt-sienna/5 border border-transparent hover:border-cork-shadow rounded-full transition-colors cursor-pointer"
                                    title="Remove Employee"
                                  >
                                    <Trash2 className="w-4 h-4 stroke-[1.5]" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
