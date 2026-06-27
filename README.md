# OrgWare: Multi-Tenant SaaS Architecture

OrgWare is a robust, multi-tenant SaaS application built with Next.js, featuring isolated database schemas per organization, role-based access control (RBAC), and a dynamic cinematic landing page (ORYZO AI style). 

The platform supports multiple departments (CRM, HR, Operations, Property, and Accounts) seamlessly integrated into a centralized dashboard, where data is completely isolated by tenant and restricted by user roles.

## Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (Neon, Vercel Postgres, Supabase, or local instance)

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
JWT_SECRET="your-secure-jwt-secret-key"
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on Database Schemas:** OrgWare handles schema creation automatically! When a new organization registers, a master `organizations` entry is created alongside a new isolated schema (`org_{id}`) containing all necessary tables (`employees`, `crm_leads`, `hr_leave_requests`, etc.). No manual SQL migration is required.

---

## Test Accounts & Demo Guide

We have seeded the database with a test organization (`ibm_001`) and multiple users with different roles so you can test the RBAC dashboard.

**Organization ID:** `ibm_001`

### 1. Super Admin
The Super Admin has access to the Admin Panel and all dashboard modules, and can manage other users' roles.
* **Email:** `ank1@gmail.com`
* **Password:** `ank1@123`
* **Role:** `super_admin`

### 2. General & Department Employees
The following users are assigned to various departments. All of them use the same password: **`password123`**

| Email | Role | Access Level |
| :--- | :--- | :--- |
| `crm1@ibm.com` | `crm_manager` | Can access CRM and Workspace, manage CRM Leads |
| `crm2@ibm.com` | `crm_user` | Can access CRM and Workspace |
| `hr1@ibm.com` | `hr_manager` | Can access HR and Workspace, approve/reject leaves |
| `ops1@ibm.com` | `ops_manager` | Can access Operations and Workspace |
| `emp1@ibm.com` | `employee` | Can view the general dashboard modules |
| `emp2@ibm.com` | `employee` | Can view the general dashboard modules |
| `emp3@ibm.com` | `employee` | Can view the general dashboard modules |

*Try logging in with different accounts in incognito tabs to see how the dashboard layout and permissions change!*

---

## Architecture Overview

### Single Source of Truth for Roles
`src/lib/roles.js` is the only place that defines which roles can access which department, default landing pages, and role UI logic. Every guard (server pages, API routes, sidebar nav) reads from here so access rules never drift out of sync.

### Database Isolation
Each tenant schema (`org_<id>`) provisions tables for:
- `employees`
- `crm_leads`
- `hr_leave_requests`
- `ops_tasks`
- `properties`
- `transactions`

For older organizations, `ensureDepartmentTables(orgId)` is called defensively to self-heal missing tables without manual migrations.

### API Routes & Server Components
- **Department Pages** are Server Components. They check auth (`requireDepartmentAccess`) and fetch data server-side (no loading spinners).
- **Interactive Mutations** (like leave-approval buttons or "add lead" forms) are decoupled into small Client Components that call the corresponding `/api/<dept>` routes.

--