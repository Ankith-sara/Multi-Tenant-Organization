# OrgWare: Multi-Tenant SaaS Architecture

OrgWare is a robust, multi-tenant SaaS application built with Next.js, featuring isolated database schemas per organization and fine-grained role-based access control (RBAC).

## Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory and add your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on Database Schemas**: The system will automatically create a master `organizations` table and isolated schemas (`org_{id}`) for each new organization you register!

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

## Deployment Guide

Deploying OrgWare requires a Postgres database (such as Neon, Supabase, or Vercel Postgres) and a Node.js hosting provider (Vercel is recommended).

### 1. Set up your Production Database
1. Create a PostgreSQL database instance. We recommend **Neon** or **Vercel Postgres** for serverless scaling.
2. Copy the provided connection string (URI). Ensure it includes `sslmode=require` if required by your provider.

### 2. Deploy to Vercel
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import your repository.
4. In the **Environment Variables** section, add:
   * **Key:** `DATABASE_URL`
   * **Value:** *(Paste your Postgres connection string here)*
5. Click **Deploy**.

Vercel will automatically build the Next.js app and deploy it. Since OrgWare automatically handles schema and table migrations during the signup flow (via `initMasterTable`), you do not need to manually run any SQL scripts! The master table will be created on the very first signup request.
