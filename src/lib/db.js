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

    // 4. Create department tables in the organization schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS org_${safeOrgId}.crm_leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        value NUMERIC(12,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'New',
        owner_id INTEGER REFERENCES org_${safeOrgId}.employees(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS org_${safeOrgId}.hr_leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES org_${safeOrgId}.employees(id) ON DELETE CASCADE,
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        reviewed_by INTEGER REFERENCES org_${safeOrgId}.employees(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS org_${safeOrgId}.ops_tasks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        progress INTEGER DEFAULT 0,
        node VARCHAR(100) DEFAULT 'node-default',
        status VARCHAR(20) DEFAULT 'Queued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS org_${safeOrgId}.properties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        property_type VARCHAR(50) DEFAULT 'Residential',
        rent NUMERIC(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Vacant',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS org_${safeOrgId}.transactions (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        txn_date DATE DEFAULT CURRENT_DATE,
        amount NUMERIC(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Unpaid',
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

// Ensures department tables exist for an org created before this feature shipped.
// Safe to call on every request; CREATE TABLE IF NOT EXISTS is a no-op when already present.
export async function ensureDepartmentTables(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS org_${safeOrgId}.crm_leads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      value NUMERIC(12,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'New',
      owner_id INTEGER REFERENCES org_${safeOrgId}.employees(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS org_${safeOrgId}.hr_leave_requests (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES org_${safeOrgId}.employees(id) ON DELETE CASCADE,
      leave_type VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'Pending',
      reviewed_by INTEGER REFERENCES org_${safeOrgId}.employees(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS org_${safeOrgId}.ops_tasks (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      progress INTEGER DEFAULT 0,
      node VARCHAR(100) DEFAULT 'node-default',
      status VARCHAR(20) DEFAULT 'Queued',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS org_${safeOrgId}.properties (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      property_type VARCHAR(50) DEFAULT 'Residential',
      rent NUMERIC(12,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Vacant',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS org_${safeOrgId}.transactions (
      id SERIAL PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      txn_date DATE DEFAULT CURRENT_DATE,
      amount NUMERIC(12,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Unpaid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
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

// ============== CRM LEADS ==============

export async function listCrmLeads(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `SELECT * FROM org_${safeOrgId}.crm_leads ORDER BY created_at DESC`
  );
  return res.rows;
}

export async function createCrmLead(orgId, { name, email, value, status, ownerId }) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `INSERT INTO org_${safeOrgId}.crm_leads (name, email, value, status, owner_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email || null, value || 0, status || 'New', ownerId || null]
  );
  return res.rows[0];
}

export async function updateCrmLeadStatus(orgId, leadId, status) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `UPDATE org_${safeOrgId}.crm_leads SET status = $1 WHERE id = $2 RETURNING *`,
    [status, leadId]
  );
  return res.rows[0] || null;
}

// ============== HR LEAVE REQUESTS ==============

export async function listHrLeaveRequests(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(`
    SELECT lr.*, e.email AS employee_email
    FROM org_${safeOrgId}.hr_leave_requests lr
    JOIN org_${safeOrgId}.employees e ON e.id = lr.employee_id
    ORDER BY lr.created_at DESC
  `);
  return res.rows;
}

export async function listHrLeaveRequestsForEmployee(orgId, employeeId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `SELECT * FROM org_${safeOrgId}.hr_leave_requests WHERE employee_id = $1 ORDER BY created_at DESC`,
    [employeeId]
  );
  return res.rows;
}

export async function createHrLeaveRequest(orgId, { employeeId, leaveType, startDate, endDate }) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `INSERT INTO org_${safeOrgId}.hr_leave_requests (employee_id, leave_type, start_date, end_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [employeeId, leaveType, startDate, endDate]
  );
  return res.rows[0];
}

export async function updateHrLeaveStatus(orgId, leaveId, status, reviewerId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `UPDATE org_${safeOrgId}.hr_leave_requests SET status = $1, reviewed_by = $2 WHERE id = $3 RETURNING *`,
    [status, reviewerId || null, leaveId]
  );
  return res.rows[0] || null;
}

// ============== OPERATIONS TASKS ==============

export async function listOpsTasks(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `SELECT * FROM org_${safeOrgId}.ops_tasks ORDER BY created_at DESC`
  );
  return res.rows;
}

export async function createOpsTask(orgId, { name, node }) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `INSERT INTO org_${safeOrgId}.ops_tasks (name, node, progress, status)
     VALUES ($1, $2, 0, 'Running') RETURNING *`,
    [name, node || 'node-us-east-1a']
  );
  return res.rows[0];
}

export async function updateOpsTaskProgress(orgId, taskId, progress, status) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `UPDATE org_${safeOrgId}.ops_tasks SET progress = $1, status = $2 WHERE id = $3 RETURNING *`,
    [progress, status, taskId]
  );
  return res.rows[0] || null;
}

// ============== PROPERTIES ==============

export async function listProperties(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `SELECT * FROM org_${safeOrgId}.properties ORDER BY created_at DESC`
  );
  return res.rows;
}

export async function createProperty(orgId, { name, propertyType, rent, status }) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `INSERT INTO org_${safeOrgId}.properties (name, property_type, rent, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, propertyType || 'Residential', rent || 0, status || 'Vacant']
  );
  return res.rows[0];
}

export async function updatePropertyStatus(orgId, propertyId, status) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `UPDATE org_${safeOrgId}.properties SET status = $1 WHERE id = $2 RETURNING *`,
    [status, propertyId]
  );
  return res.rows[0] || null;
}

// ============== ACCOUNTS / TRANSACTIONS ==============

export async function listTransactions(orgId) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `SELECT * FROM org_${safeOrgId}.transactions ORDER BY txn_date DESC`
  );
  return res.rows;
}

export async function createTransaction(orgId, { clientName, amount, status }) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `INSERT INTO org_${safeOrgId}.transactions (client_name, amount, status)
     VALUES ($1, $2, $3) RETURNING *`,
    [clientName, amount || 0, status || 'Unpaid']
  );
  return res.rows[0];
}

export async function updateTransactionStatus(orgId, txnId, status) {
  const safeOrgId = sanitizeOrgId(orgId);
  const res = await pool.query(
    `UPDATE org_${safeOrgId}.transactions SET status = $1 WHERE id = $2 RETURNING *`,
    [status, txnId]
  );
  return res.rows[0] || null;
}

export { pool };
