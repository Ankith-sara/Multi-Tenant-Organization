import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import { 
  listEmployees, 
  createEmployee, 
  getEmployeeByEmail, 
  updateEmployeeRole,
  deleteEmployee,
  ensureDepartmentTables
} from '@/lib/db';

// Helper to authenticate session
async function authenticate() {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized. Please log in.', status: 401 };
  }
  return { session };
}

// GET: Retrieve all employees for the organization
export async function GET(request) {
  try {
    const auth = await authenticate();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { organization_id } = auth.session;
    // Self-heals department tables for organizations created before this feature shipped.
    await ensureDepartmentTables(organization_id);
    const employees = await listEmployees(organization_id);

    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    console.error('List employees error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching employees.' },
      { status: 500 }
    );
  }
}

// POST: Add a new employee (Super Admin only)
export async function POST(request) {
  try {
    const auth = await authenticate();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { organization_id, role: currentUserRole, id: currentUserId } = auth.session;

    // Check if the current user is a super admin
    if (currentUserRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden. Only the Super Admin can add new employees.' },
        { status: 403 }
      );
    }

    const { email, password, role } = await request.json();

    // Validate inputs
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields (email, password, role) are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if email already exists in organization
    const existingEmployee = await getEmployeeByEmail(organization_id, email);
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'An employee with this email already exists in the organization.' },
        { status: 409 }
      );
    }

    // Hash password and create employee
    const passwordHash = await bcrypt.hash(password, 10);
    const newEmployee = await createEmployee(organization_id, email, passwordHash, role);

    return NextResponse.json({
      message: 'Employee added successfully.',
      employee: {
        id: newEmployee.id,
        email: newEmployee.email,
        role: newEmployee.role,
        created_at: newEmployee.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding the employee.' },
      { status: 500 }
    );
  }
}

// PATCH: Update an employee's role (Super Admin only)
export async function PATCH(request) {
  try {
    const auth = await authenticate();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { organization_id, role: currentUserRole, id: currentUserId } = auth.session;

    // Check if current user is super admin
    if (currentUserRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden. Only the Super Admin can assign roles.' },
        { status: 403 }
      );
    }

    const { employeeId, role } = await request.json();

    if (!employeeId || !role) {
      return NextResponse.json(
        { error: 'employeeId and role are required.' },
        { status: 400 }
      );
    }

    // Prevent super admin from demoting themselves to maintain at least one super admin
    if (parseInt(employeeId) === parseInt(currentUserId)) {
      return NextResponse.json(
        { error: 'Forbidden. You cannot change your own Super Admin role.' },
        { status: 400 }
      );
    }

    const updatedEmployee = await updateEmployeeRole(organization_id, employeeId, role);
    if (!updatedEmployee) {
      return NextResponse.json(
        { error: 'Employee not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Employee role updated successfully.',
      employee: updatedEmployee
    }, { status: 200 });

  } catch (error) {
    console.error('Update employee role error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating employee role.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an employee (Super Admin only)
export async function DELETE(request) {
  try {
    const auth = await authenticate();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { organization_id, role: currentUserRole, id: currentUserId } = auth.session;

    // Check if the current user is a super admin
    if (currentUserRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden. Only the Super Admin can remove employees.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID (id) query parameter is required.' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (parseInt(employeeId) === parseInt(currentUserId)) {
      return NextResponse.json(
        { error: 'Forbidden. You cannot remove your own Super Admin account.' },
        { status: 400 }
      );
    }

    const removedEmployee = await deleteEmployee(organization_id, employeeId);
    if (!removedEmployee) {
      return NextResponse.json(
        { error: 'Employee not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Employee removed successfully.',
      employee: removedEmployee
    }, { status: 200 });

  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing the employee.' },
      { status: 500 }
    );
  }
}
