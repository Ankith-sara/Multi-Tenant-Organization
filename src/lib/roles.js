// Centralized role configuration.
// This is the single source of truth for role display, role grouping, and
// department-level access control. Every guard (server pages, API routes,
// sidebar nav) reads from here so access rules can't drift out of sync.

export const DEPARTMENTS = {
  workspace: { label: 'Workspace', path: '/dashboard/workspace' },
  crm: { label: 'CRM', path: '/dashboard/crm' },
  hr: { label: 'HR', path: '/dashboard/hr' },
  operations: { label: 'Operations', path: '/dashboard/operations' },
  property: { label: 'Property', path: '/dashboard/property' },
  accounts: { label: 'Accounts', path: '/dashboard/accounts' },
};

// Roles that bypass department restrictions entirely.
const FULL_ACCESS_ROLES = new Set(['super_admin', 'admin']);

// Maps a role to the departments it may access (beyond workspace, which is universal).
function departmentsForRole(role) {
  if (!role) return [];
  if (FULL_ACCESS_ROLES.has(role)) {
    return Object.keys(DEPARTMENTS);
  }
  if (role.startsWith('crm_')) return ['workspace', 'crm'];
  if (role.startsWith('hr_')) return ['workspace', 'hr'];
  if (role.startsWith('operations_')) return ['workspace', 'operations'];
  if (role.startsWith('property_')) return ['workspace', 'property'];
  if (role === 'finance_manager' || role === 'accountant') return ['workspace', 'accounts'];
  // Give general employees access to all dashboard modules (view only if not manager)
  if (role === 'employee') return Object.keys(DEPARTMENTS);
  // Unrecognized roles
  return ['workspace'];
}

// Returns true if the given role may access the given department key.
export function canAccessDepartment(role, departmentKey) {
  return departmentsForRole(role).includes(departmentKey);
}

// Returns the ordered list of department configs a role can see, for nav rendering.
export function getAccessibleDepartments(role) {
  const allowed = new Set(departmentsForRole(role));
  return Object.entries(DEPARTMENTS)
    .filter(([key]) => allowed.has(key))
    .map(([key, cfg]) => ({ key, ...cfg }));
}

// The department a role should land on after login.
export function getDefaultDepartment(role) {
  const accessible = departmentsForRole(role);
  if (!role) return 'workspace';
  if (FULL_ACCESS_ROLES.has(role)) return 'workspace';
  // First non-workspace department is the role's "home"; fall back to workspace.
  return accessible.find((d) => d !== 'workspace') || 'workspace';
}

// Roles that may approve/reject HR leave requests, manage CRM leads beyond their own, etc.
export function isManagerRole(role) {
  if (!role) return false;
  return FULL_ACCESS_ROLES.has(role) || role.endsWith('_manager');
}

export function getRoleDetails(role) {
  switch (role) {
    case 'super_admin':
      return { label: 'Super Admin', classes: 'bg-burnt-sienna/10 text-burnt-sienna border-burnt-sienna/30', dotClass: 'bg-burnt-sienna' };
    case 'admin':
      return { label: 'General Admin', classes: 'bg-warm-cream/10 text-warm-cream border-warm-cream/30', dotClass: 'bg-warm-cream' };
    case 'employee':
      return { label: 'General Employee', classes: 'bg-transparent text-grey-brown border-cork-shadow', dotClass: 'bg-cork-shadow' };

    case 'property_manager':
      return { label: 'Property Manager', classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', dotClass: 'bg-warm-cream' };
    case 'property_associate':
      return { label: 'Property Associate', classes: 'bg-transparent text-grey-brown border-cork-shadow', dotClass: 'bg-cork-shadow' };

    case 'crm_manager':
      return { label: 'CRM Manager', classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', dotClass: 'bg-warm-cream' };
    case 'crm_agent':
      return { label: 'CRM Agent', classes: 'bg-transparent text-grey-brown border-cork-shadow', dotClass: 'bg-cork-shadow' };

    case 'operations_manager':
      return { label: 'Operations Manager', classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', dotClass: 'bg-warm-cream' };
    case 'operations_associate':
      return { label: 'Operations Associate', classes: 'bg-transparent text-grey-brown border-cork-shadow', dotClass: 'bg-cork-shadow' };

    case 'hr_manager':
      return { label: 'HR Manager', classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', dotClass: 'bg-warm-cream' };
    case 'hr_specialist':
      return { label: 'HR Specialist', classes: 'bg-transparent text-grey-brown border-cork-shadow', dotClass: 'bg-cork-shadow' };

    case 'finance_manager':
      return { label: 'Finance Manager', classes: 'bg-warm-cream/5 text-warm-cream border-warm-cream/25', dotClass: 'bg-warm-cream' };
    case 'accountant':
      return { label: 'Accountant', classes: 'bg-transparent text-grey-brown border-cork-shadow', dotClass: 'bg-cork-shadow' };

    default:
      return {
        label: role ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown',
        classes: 'bg-transparent text-grey-brown border-cork-shadow',
        dotClass: 'bg-cork-shadow',
      };
  }
}

export const ROLE_OPTIONS = [
  { group: 'Core Roles', options: [
    { value: 'employee', label: 'General Employee' },
    { value: 'admin', label: 'General Admin' },
  ]},
  { group: 'Property Department', options: [
    { value: 'property_manager', label: 'Property Manager' },
    { value: 'property_associate', label: 'Property Associate' },
  ]},
  { group: 'CRM Department', options: [
    { value: 'crm_manager', label: 'CRM Manager' },
    { value: 'crm_agent', label: 'CRM Agent' },
  ]},
  { group: 'Operations Department', options: [
    { value: 'operations_manager', label: 'Operations Manager' },
    { value: 'operations_associate', label: 'Operations Associate' },
  ]},
  { group: 'HR Department', options: [
    { value: 'hr_manager', label: 'HR Manager' },
    { value: 'hr_specialist', label: 'HR Specialist' },
  ]},
  { group: 'Accounts Department', options: [
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'accountant', label: 'Accountant' },
  ]},
];

// Same as ROLE_OPTIONS but includes Super Admin under Core Roles.
// Used only when changing an EXISTING employee's role (promotion), never
// when creating a brand-new employee — new employees should never be able
// to self-select super_admin at creation time.
export const PROMOTABLE_ROLE_OPTIONS = ROLE_OPTIONS.map((group) =>
  group.group === 'Core Roles'
    ? { ...group, options: [...group.options, { value: 'super_admin', label: 'Super Admin' }] }
    : group
);
