import pg from 'pg';

const { Pool } = pg;

let pool;

if (!global._postgresPool) {
  global._postgresPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}
pool = global._postgresPool;

// Sanitizes organization ID to prevent SQL injection in schema names
export function sanitizeOrgId(orgId) {
  return orgId.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
}

// Initializes the master table in the default public schema
export async function initMasterTable() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS public.organizations (
      organization_id VARCHAR(100) PRIMARY KEY,
      display_name VARCHAR(100),
      owner_email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(queryText);

  // Proactively run ALTER TABLE to ensure existing DB has display_name column
  try {
    await pool.query(`
      ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
    `);
  } catch (err) {
    console.warn('Did not need to alter table or not supported:', err.message);
  }
}

// Dynamically creates a schema for the organization and builds the employees table inside it
export async function createOrganizationSchema(orgId, ownerEmail) {
  const safeOrgId = sanitizeOrgId(orgId);
  if (!safeOrgId) {
    throw new Error('Invalid organization ID after sanitization.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Register in master table using sanitized ID as org_id and raw orgId as display_name
    await client.query(
      `INSERT INTO public.organizations (organization_id, display_name, owner_email) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (organization_id) DO NOTHING`,
      [safeOrgId, orgId, ownerEmail]
    );

    // 2. Create organization schema
    await client.query(`CREATE SCHEMA IF NOT EXISTS org_${safeOrgId}`);

    // 3. Create employees table in the organization schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS org_${safeOrgId}.employees (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Checks if organization exists in the master database using sanitized ID (case-insensitive)
export async function checkOrganizationExists(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    'SELECT 1 FROM public.organizations WHERE LOWER(organization_id) = LOWER($1)',
    [safeOrgId]
  );
  return res.rowCount > 0;
}

// Fetches organization details by sanitized ID (case-insensitive)
export async function getOrganizationDetails(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    'SELECT * FROM public.organizations WHERE LOWER(organization_id) = LOWER($1)',
    [safeOrgId]
  );
  return res.rows[0] || null;
}


// Fetches an employee by email inside a specific organization schema
export async function getEmployeeByEmail(orgId, email) {
  const safeOrgId = sanitizeOrgId(orgId);
  const queryText = `
    SELECT * FROM org_${safeOrgId}.employees 
    WHERE email = $1
  `;
  const res = await pool.query(queryText, [email]);
  return res.rows[0] || null;
}

// Checks if there are any employees in the organization schema (to determine if first employee)
export async function getEmployeeCount(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const queryText = `
    SELECT COUNT(*)::integer as count FROM org_${safeOrgId}.employees
  `;
  const res = await pool.query(queryText);
  return res.rows[0].count;
}

// Creates a new employee inside the organization schema
export async function createEmployee(orgId, email, passwordHash, role) {
  const safeOrgId = sanitizeOrgId(orgId);
  
  // Check the current count of employees in this tenant schema
  const countRes = await pool.query(`SELECT COUNT(*) FROM org_${safeOrgId}.employees`);
  const count = parseInt(countRes.rows[0].count);
  
  let finalRole = role;
  if (count === 0) {
    // The very first employee of the organization is always super_admin
    finalRole = 'super_admin';
  } else {
    // Subsequent users are 'employee' by default unless designated as 'admin'
    if (!role || role === 'super_admin') {
      finalRole = 'employee';
    }
  }

  const queryText = `
    INSERT INTO org_${safeOrgId}.employees (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role, created_at
  `;
  const res = await pool.query(queryText, [email, passwordHash, finalRole]);
  return res.rows[0];
}

// Lists all employees in the organization schema
export async function listEmployees(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const queryText = `
    SELECT id, email, role, created_at FROM org_${safeOrgId}.employees
    ORDER BY id ASC
  `;
  const res = await pool.query(queryText);
  return res.rows;
}

// Updates employee's role in the organization schema
export async function updateEmployeeRole(orgId, employeeId, role) {
  const safeOrgId = sanitizeOrgId(orgId);
  const queryText = `
    UPDATE org_${safeOrgId}.employees
    SET role = $1
    WHERE id = $2
    RETURNING id, email, role
  `;
  const res = await pool.query(queryText, [role, employeeId]);
  return res.rows[0] || null;
}

// Deletes an employee from the organization schema
export async function deleteEmployee(orgId, employeeId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const queryText = `
    DELETE FROM org_${safeOrgId}.employees
    WHERE id = $1
    RETURNING id, email, role
  `;
  const res = await pool.query(queryText, [employeeId]);
  return res.rows[0] || null;
}

export { pool };
