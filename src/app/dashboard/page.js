'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  Building, 
  Mail, 
  User, 
  Users, 
  LogOut, 
  Loader2, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  Activity,
  DollarSign,
  Briefcase,
  Layers,
  Plus,
  FileText,
  Check,
  X,
  Play
} from 'lucide-react';
import ThemeToggle from '@/app/ThemeToggle';

export function getRoleDetails(role) {
  switch (role) {
    case 'super_admin':
      return { 
        label: 'Super Admin', 
        classes: 'bg-burnt-sienna/10 text-burnt-sienna border-burnt-sienna/30', 
        dotClass: 'bg-burnt-sienna' 
      };
    case 'admin':
      return { 
        label: 'General Admin', 
        classes: 'bg-warm-cream/10 text-warm-cream border-warm-cream/30', 
        dotClass: 'bg-warm-cream' 
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

function getDefaultDashboard(role) {
  if (!role) return 'workspace';
  if (role.startsWith('crm_')) return 'crm';
  if (role.startsWith('hr_')) return 'hr';
  if (role.startsWith('operations_')) return 'operations';
  if (role.startsWith('property_')) return 'property';
  if (role === 'finance_manager' || role === 'accountant') return 'accounts';
  return 'workspace'; // super_admin, admin, employee
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workspace');

  // Interactive CRM Leads state
  const [crmLeads, setCrmLeads] = useState([
    { id: 1, name: 'Acme Corp Inc', email: 'billing@acme.com', value: '$15,000', status: 'Proposal' },
    { id: 2, name: 'Lexington Estates', email: 'contact@lexington.io', value: '$28,500', status: 'New' },
    { id: 3, name: 'Stark Industries', email: 'pepper@stark.com', value: '$120,000', status: 'Won' },
  ]);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadValue, setNewLeadValue] = useState('');
  const [newLeadStatus, setNewLeadStatus] = useState('New');

  // Interactive HR Leave state
  const [hrLeaves, setHrLeaves] = useState([]);

  // Interactive Operations System Tasks state
  const [systemTasks, setSystemTasks] = useState([
    { id: 1, name: 'Schema Backup partition_oryzostudio', progress: 100, node: 'node-us-east-1a', status: 'Completed' },
    { id: 2, name: 'Re-index database tables', progress: 45, node: 'node-us-east-1b', status: 'Running' },
    { id: 3, name: 'Sync logs to audit S3 bucket', progress: 0, node: 'node-us-west-2', status: 'Queued' },
  ]);

  // Property state
  const [properties, setProperties] = useState([
    { id: 1, name: 'Sienna Studio Loft 4B', type: 'Residential', rent: '$3,200', status: 'Occupied' },
    { id: 2, name: 'Blackout Warehouse Sector 2', type: 'Commercial', rent: '$18,500', status: 'Occupied' },
    { id: 3, name: 'Cork Coaster Cafe Site', type: 'Commercial', rent: '$6,400', status: 'Vacant' },
  ]);

  // Accounts state
  const [transactions, setTransactions] = useState([
    { id: 1, client: 'Stark Industries', date: '2026-06-25', amount: '$120,000', status: 'Paid' },
    { id: 2, client: 'Lexington Estates', date: '2026-06-26', amount: '$2,850', status: 'Unpaid' },
    { id: 3, client: 'Acme Corp Inc', date: '2026-06-27', amount: '$15,000', status: 'Paid' },
  ]);

  useEffect(() => {
    async function checkAuthAndFetchData() {
      try {
        // 1. Get current session
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        
        if (!meData.user) {
          router.push('/login');
          return;
        }
        setUser(meData.user);
        
        // Set default tab based on user role
        setActiveTab(getDefaultDashboard(meData.user.role));

        // 2. Fetch employees for current organization
        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const empData = await empRes.json();
          const fetchedEmployees = empData.employees || [];
          setEmployees(fetchedEmployees);

          // Populate leave requests exclusively for this organization's actual employees
          const dynamicLeaves = fetchedEmployees.map((emp, index) => {
            const leaveTypes = ['Vacation', 'Sick Leave', 'Personal'];
            const dateRanges = ['Jun 28 - Jul 5', 'Jun 30 - Jul 1', 'Jul 15 - Jul 16', 'Jul 20 - Jul 25'];
            const statuses = ['Pending', 'Approved', 'Pending', 'Rejected'];
            
            return {
              id: emp.id,
              email: emp.email,
              type: leaveTypes[index % leaveTypes.length],
              dates: dateRanges[index % dateRanges.length],
              status: statuses[index % statuses.length],
            };
          });
          setHrLeaves(dynamicLeaves);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchData();
  }, [router]);

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

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail || !newLeadValue) return;
    const newLead = {
      id: Date.now(),
      name: newLeadName,
      email: newLeadEmail,
      value: newLeadValue.startsWith('$') ? newLeadValue : `$${newLeadValue}`,
      status: newLeadStatus,
    };
    setCrmLeads((prev) => [...prev, newLead]);
    setNewLeadName('');
    setNewLeadEmail('');
    setNewLeadValue('');
    setNewLeadStatus('New');
  };

  const handleUpdateLeaveStatus = (id, newStatus) => {
    setHrLeaves((prev) =>
      prev.map((leave) => (leave.id === id ? { ...leave, status: newStatus } : leave))
    );
  };

  const handleTriggerTask = () => {
    const newTask = {
      id: Date.now(),
      name: 'Partition Health Integrity Check',
      progress: 0,
      node: 'node-us-east-1a',
      status: 'Running',
    };
    setSystemTasks((prev) => [newTask, ...prev]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setSystemTasks((prev) =>
        prev.map((t) =>
          t.id === newTask.id
            ? { ...t, progress: currentProgress, status: currentProgress >= 100 ? 'Completed' : 'Running' }
            : t
        )
      );
      if (currentProgress >= 100) clearInterval(interval);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-studio-black flex flex-col items-center justify-center text-warm-cream">
        <Loader2 className="w-10 h-10 animate-spin text-burnt-sienna mb-4" />
        <p className="text-grey-brown text-sm">Loading your workspace...</p>
      </div>
    );
  }

  if (!user) return null;

  const isSuperAdmin = user.role === 'super_admin';
  const isAdmin = user.role === 'admin';
  const hasFullMenuAccess = isSuperAdmin || isAdmin;

  return (
    <div className="flex-1 min-h-screen bg-studio-black text-warm-cream flex flex-col font-sans selection:bg-burnt-sienna selection:text-studio-black">
      {/* Navbar */}
      <nav className="w-full bg-studio-black border-b border-cork-shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-burnt-sienna p-1">
              <Shield className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-none">OrgWare</span>
              <span className="text-grey-brown text-[10px] uppercase font-semibold mt-0.5 tracking-wider">
                {user.role && (user.role.toLowerCase().startsWith('hr') || user.role.toLowerCase() === 'hr') ? 'HR' : 'Workspace'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[22.5px] border border-cork-shadow text-xs text-grey-brown">
              <Building className="w-3.5 h-3.5 text-burnt-sienna" />
              <span>Org: <strong className="text-warm-cream capitalize">{user.display_name || user.organization_id}</strong></span>
            </div>
            
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

      {/* Top Roles Navigation bar for Super Admins / Admins */}
      {hasFullMenuAccess && (
        <div className="w-full border-b border-cork-shadow bg-studio-black sticky top-[73px] z-10">
          <div className="max-w-7xl mx-auto px-6 flex gap-8 overflow-x-auto">
            {[
              { id: 'workspace', label: 'Workspace' },
              { id: 'crm', label: 'CRM Leads' },
              { id: 'hr', label: 'HR Portal' },
              { id: 'operations', label: 'Operations' },
              { id: 'property', label: 'Properties' },
              { id: 'accounts', label: 'Accounts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-all duration-300 cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'border-burnt-sienna text-warm-cream'
                    : 'border-transparent text-grey-brown hover:text-warm-cream'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col gap-8">
        
        {/* Welcome Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-[12px] border border-dashed border-cork-shadow">
          <div>
            <span className="text-burnt-sienna text-[10px] font-semibold uppercase tracking-wider">
              System Dashboard
            </span>
            <h1 className="text-[29px] font-medium tracking-tight mt-1 mb-2 leading-none">
              {user.email}
            </h1>
            <p className="text-grey-brown text-sm font-light">
              You are logged into <span className="text-warm-cream font-medium capitalize">{user.display_name || user.organization_id}</span>'s network workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-grey-brown">Active Role:</span>
            {(() => {
              const details = getRoleDetails(user.role);
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${details.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${details.dotClass}`} />
                  {details.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* WORKSPACE DIRECTORY TAB */}
        {activeTab === 'workspace' && (
          <>
            {isSuperAdmin && (
              <div className="p-6 rounded-[12px] border border-dashed border-burnt-sienna/30 bg-burnt-sienna/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="text-burnt-sienna p-1">
                    <Shield className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[18px] text-warm-cream">Super Admin Control Center</h3>
                    <p className="text-grey-brown text-sm mt-0.5 leading-relaxed">
                      As the first employee of {user.display_name || user.organization_id}, you hold full super-admin access. You can add new members and configure their authorization levels.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin"
                  className="w-full md:w-auto px-6 py-3.5 rounded-[36px] bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  Open Admin Panel
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-burnt-sienna" />
                <h2 className="text-[18px] font-medium">Workspace Directory</h2>
                <span className="px-2 py-0.5 rounded border border-cork-shadow text-[10px] text-grey-brown font-semibold ml-2">
                  {employees.length} members
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
                      <th className="py-4 px-4 font-semibold">Member Email</th>
                      <th className="py-4 px-4 font-semibold">Authorization Role</th>
                      <th className="py-4 px-4 hidden sm:table-cell font-semibold">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cork-shadow/40 text-sm">
                    {employees.map((emp) => {
                      const isCurrent = emp.id === user.id;
                      return (
                        <tr 
                          key={emp.id} 
                          className={`hover:bg-warm-cream/[0.02] transition-colors ${
                            isCurrent ? 'bg-warm-cream/[0.01]' : ''
                          }`}
                        >
                          <td className="py-4 px-4 font-medium flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full border border-cork-shadow flex items-center justify-center text-warm-cream font-semibold text-xs bg-transparent">
                              {emp.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-warm-cream">
                                {emp.email}
                                {isCurrent && (
                                  <span className="ml-2 text-[10px] border border-burnt-sienna/20 bg-burnt-sienna/5 text-burnt-sienna px-2 py-0.5 rounded-full font-medium">
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
                          <td className="py-4 px-4 text-grey-brown hidden sm:table-cell">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-grey-brown stroke-[1.5]" />
                              {new Date(emp.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* CRM DASHBOARD TAB */}
        {activeTab === 'crm' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Total CRM Leads</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{crmLeads.length}</div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Active Pipelines</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">
                  {crmLeads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length}
                </div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Deals Closed Won</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">
                  {crmLeads.filter(l => l.status === 'Won').length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Leads Table */}
              <div className="lg:col-span-2 p-8 rounded-[12px] border border-dashed border-cork-shadow">
                <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-burnt-sienna" />
                  Active Sales Pipeline
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
                        <th className="py-3 px-2">Account Name</th>
                        <th className="py-3 px-2">Contact Email</th>
                        <th className="py-3 px-2">Deal Size</th>
                        <th className="py-3 px-2">Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cork-shadow/40 text-sm">
                      {crmLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                          <td className="py-3 px-2 text-warm-cream font-medium">{lead.name}</td>
                          <td className="py-3 px-2 text-grey-brown">{lead.email}</td>
                          <td className="py-3 px-2 text-warm-cream font-semibold">{lead.value}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              lead.status === 'Won' 
                                ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                                : lead.status === 'Proposal'
                                ? 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream'
                                : 'bg-transparent border-cork-shadow text-grey-brown'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Lead Form */}
              <div className="lg:col-span-1 p-8 rounded-[12px] border border-dashed border-cork-shadow flex flex-col justify-between">
                <div>
                  <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-burnt-sienna" />
                    New Pipeline Lead
                  </h2>
                  <form onSubmit={handleAddLead} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        placeholder="Acme Corp"
                        className="bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-sm px-1 py-1.5 transition-colors duration-300 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={newLeadEmail}
                        onChange={(e) => setNewLeadEmail(e.target.value)}
                        placeholder="deal@acme.com"
                        className="bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-sm px-1 py-1.5 transition-colors duration-300 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1">
                        Deal Value ($)
                      </label>
                      <input
                        type="text"
                        value={newLeadValue}
                        onChange={(e) => setNewLeadValue(e.target.value)}
                        placeholder="25000"
                        className="bg-transparent border-0 border-b border-cork-shadow focus:border-warm-cream focus:ring-0 rounded-none text-warm-cream placeholder-warm-cream/30 outline-none text-sm px-1 py-1.5 transition-colors duration-300 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-grey-brown mb-1">
                        Pipeline Status
                      </label>
                      <select
                        value={newLeadStatus}
                        onChange={(e) => setNewLeadStatus(e.target.value)}
                        className="bg-studio-black border border-cork-shadow focus:border-warm-cream text-warm-cream outline-none text-sm px-2 py-1.5 transition-colors duration-300 w-full rounded-[6px]"
                      >
                        <option value="New">New Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Proposal">Proposal Submitted</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-4 py-2.5 bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[22.5px] text-xs font-semibold cursor-pointer transition-all duration-300"
                    >
                      Add Lead Account
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HR DASHBOARD TAB */}
        {activeTab === 'hr' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Active Members</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{employees.length}</div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Pending Leaves</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">
                  {hrLeaves.filter(l => l.status === 'Pending').length}
                </div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Total Departments</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">5</div>
              </div>
            </div>

            <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
              <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-burnt-sienna" />
                Employee Leave Requests Registry
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Schedule Dates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cork-shadow/40 text-sm">
                    {hrLeaves.map(leave => (
                      <tr key={leave.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                        <td className="py-4 px-4 text-warm-cream font-medium">{leave.email}</td>
                        <td className="py-4 px-4 text-grey-brown">{leave.type}</td>
                        <td className="py-4 px-4 text-warm-cream font-medium">{leave.dates}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            leave.status === 'Approved' 
                              ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                              : leave.status === 'Rejected'
                              ? 'bg-transparent border-cork-shadow text-grey-brown opacity-60'
                              : 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream'
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {leave.status === 'Pending' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateLeaveStatus(leave.id, 'Approved')}
                                className="p-1 rounded-full border border-warm-cream hover:border-burnt-sienna text-warm-cream transition-all duration-200 cursor-pointer"
                                title="Approve Leave"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateLeaveStatus(leave.id, 'Rejected')}
                                className="p-1 rounded-full border border-cork-shadow hover:border-burnt-sienna text-grey-brown hover:text-warm-cream transition-all duration-200 cursor-pointer"
                                title="Reject Leave"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-grey-brown italic">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* OPERATIONS DASHBOARD TAB */}
        {activeTab === 'operations' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Active Server Cluster</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">3 nodes</div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Scheduled Queued Tasks</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">
                  {systemTasks.filter(t => t.status === 'Queued').length}
                </div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Uptime Status</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none text-burnt-sienna">99.98%</div>
              </div>
            </div>

            <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-[18px] font-medium flex items-center gap-2">
                  <Activity className="w-5 h-5 text-burnt-sienna" />
                  Background Tasks Queue Manager
                </h2>
                <button
                  onClick={handleTriggerTask}
                  className="px-5 py-2 text-xs font-semibold bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[22.5px] transition-all duration-300 cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 text-burnt-sienna" />
                  Trigger Systems Backup
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
                      <th className="py-3 px-4">System Task</th>
                      <th className="py-3 px-4">Progress</th>
                      <th className="py-3 px-4">Cluster Node</th>
                      <th className="py-3 px-4">Task Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cork-shadow/40 text-sm">
                    {systemTasks.map(task => (
                      <tr key={task.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                        <td className="py-4 px-4 text-warm-cream font-medium">{task.name}</td>
                        <td className="py-4 px-4 w-48">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-grey-brown w-8">{task.progress}%</span>
                            <div className="flex-1 h-1.5 bg-cork-shadow/30 border border-cork-shadow rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-burnt-sienna transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-grey-brown font-mono text-xs">{task.node}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            task.status === 'Completed' 
                              ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                              : task.status === 'Running'
                              ? 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream animate-pulse'
                              : 'bg-transparent border-cork-shadow text-grey-brown'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'property' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Total Listings</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{properties.length}</div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Occupancy Rate</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none text-burnt-sienna">66.6%</div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Total Value Portfolio</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">$28,100</div>
              </div>
            </div>

            <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
              <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-burnt-sienna" />
                Managed Real Estate Listings
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
                      <th className="py-3 px-4">Property Asset</th>
                      <th className="py-3 px-4">Asset Type</th>
                      <th className="py-3 px-4">Monthly Rent</th>
                      <th className="py-3 px-4">Listing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cork-shadow/40 text-sm">
                    {properties.map(prop => (
                      <tr key={prop.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                        <td className="py-4 px-4 text-warm-cream font-medium">{prop.name}</td>
                        <td className="py-4 px-4 text-grey-brown">{prop.type}</td>
                        <td className="py-4 px-4 text-warm-cream font-medium">{prop.rent}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            prop.status === 'Occupied' 
                              ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                              : 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream'
                          }`}>
                            {prop.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Quarterly Revenue</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">$135,000</div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Ledger Invoices</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{transactions.length} total</div>
              </div>
              <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
                <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Paid Rate</span>
                <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none text-burnt-sienna">66%</div>
              </div>
            </div>

            <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
              <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-burnt-sienna" />
                Ledger Transaction Invoices
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
                      <th className="py-3 px-4">Client / Payer</th>
                      <th className="py-3 px-4">Invoice Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cork-shadow/40 text-sm">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                        <td className="py-4 px-4 text-warm-cream font-medium">{t.client}</td>
                        <td className="py-4 px-4 text-grey-brown">{t.date}</td>
                        <td className="py-4 px-4 text-warm-cream font-medium">{t.amount}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            t.status === 'Paid' 
                              ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                              : 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
