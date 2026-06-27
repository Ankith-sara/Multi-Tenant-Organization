# Architecture Notes

## What changed and why

The original `dashboard/page.js` was a single ~925-line client component that
used `activeTab` state to switch between six departments (Workspace, CRM, HR,
Operations, Property, Accounts). Five of those six departments rendered
hardcoded mock arrays (`useState([...])`) instead of real data — only the
employee directory was backed by the database. Role-based access was enforced
only by hiding tabs in the UI; visiting the dashboard with any role rendered
the same single route.

This has been restructured into a real multi-page, role-gated system.

## Routing

```
/dashboard                 -> server redirect to the user's default department
/dashboard/workspace        employee directory (everyone)
/dashboard/crm              CRM leads pipeline   (crm_*, admin, super_admin)
/dashboard/hr               leave requests       (hr_*, admin, super_admin)
/dashboard/operations       background task queue (operations_*, admin, super_admin)
/dashboard/property         property listings    (property_*, admin, super_admin)
/dashboard/accounts         invoices/transactions (finance_manager, accountant, admin, super_admin)
/admin                      employee management   (super_admin only)
```

Each department is its own route with its own `page.js`, not a tab inside one
file. `src/app/dashboard/layout.js` is a server component that runs the
session check once and renders the shared nav; each department `page.js`
additionally calls `requireDepartmentAccess(key)` from `src/lib/auth-guard.js`,
which redirects to `/login` if unauthenticated or to `/dashboard` if the
role isn't permitted — enforced server-side, so visiting a forbidden URL
directly is blocked, not just hidden from the menu.

## Single source of truth for roles

`src/lib/roles.js` is the only place that defines:
- which roles can access which department (`canAccessDepartment`)
- which department a role lands on by default (`getDefaultDepartment`)
- role display labels/colors (`getRoleDetails`)
- the dropdown options for the admin panel (`ROLE_OPTIONS`, `PROMOTABLE_ROLE_OPTIONS`)

The old code defined `getRoleDetails` independently in both `dashboard/page.js`
and `admin/page.js`, which could drift out of sync. Every guard, API route,
and UI component now imports from this one file.

## Database

Each tenant schema (`org_<id>`) now provisions six tables instead of one:
`employees`, `crm_leads`, `hr_leave_requests`, `ops_tasks`, `properties`,
`transactions`. New tables are created atomically with `employees` in
`createOrganizationSchema` (signup flow). For organizations that existed
before this change, `ensureDepartmentTables(orgId)` is called at the top of
every department API route and page — it's a set of `CREATE TABLE IF NOT
EXISTS` statements, so it's a no-op once the tables exist and self-heals old
orgs without a manual migration step.

## API routes

One route per department (`/api/crm/leads`, `/api/hr/leaves`,
`/api/operations/tasks`, `/api/property/listings`,
`/api/accounts/transactions`), each following the same pattern as the
existing `/api/employees` route: read the session, check
`canAccessDepartment`, then perform the DB operation. HR additionally
distinguishes managers (`isManagerRole`) from regular employees: managers see
and approve/reject everyone's leave requests, employees see and submit only
their own.

## Server vs. client components

Department pages are server components: they check auth and fetch initial
data on the server, so the data is present in the first response (no
loading spinner, no flash of an empty dashboard). Only the genuinely
interactive parts — the leave-approval buttons, the "add lead" form, the
task-trigger button — are separate small client components that receive
the initial data as props and call the API for mutations. This is a
deliberate split: previously the entire dashboard was client-rendered, which
meant a loading spinner on every visit and a client-side-only auth check
that could be bypassed by disabling JavaScript redirects.
