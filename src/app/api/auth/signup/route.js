import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { 
  checkOrganizationExists, 
  createOrganizationSchema, 
  createEmployee, 
  sanitizeOrgId,
  getEmployeeByEmail,
  getOrganizationDetails,
  initMasterTable
} from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST(request) {
  try {
    // Ensure master table layout is up to date (runs migrations/schema alters)
    await initMasterTable();

    const { organization_id, email, password, confirmPassword } = await request.json();

    // 1. Basic validation
    if (!organization_id || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const safeOrgId = sanitizeOrgId(organization_id);
    if (!safeOrgId) {
      return NextResponse.json(
        { error: 'Organization ID must contain alphanumeric characters or underscores.' },
        { status: 400 }
      );
    }

    // 2. Check if organization already exists in master db
    const exists = await checkOrganizationExists(organization_id);
    
    let employee;
    const passwordHash = await bcrypt.hash(password, 10);

    if (exists) {
      // Organization exists, check if email is already registered in this organization
      const existingEmployee = await getEmployeeByEmail(organization_id, email);
      if (existingEmployee) {
        return NextResponse.json(
          { error: 'An employee with this email is already registered in this organization.' },
          { status: 409 }
        );
      }

      // Add to existing organization. Role defaults to 'employee'
      employee = await createEmployee(organization_id, email, passwordHash, 'employee');
    } else {
      // Create new schema and employees table dynamically
      await createOrganizationSchema(organization_id, email);
      
      // Insert as first employee (Super Admin)
      employee = await createEmployee(organization_id, email, passwordHash, 'super_admin');
    }

    // 6. Automatically sign-in after sign-up
    const orgDetails = await getOrganizationDetails(organization_id);
    const resolvedOrgId = safeOrgId;
    const displayName = (orgDetails && orgDetails.display_name) ? orgDetails.display_name : organization_id;

    await setSession({
      organization_id: resolvedOrgId,
      display_name: displayName,
      email: employee.email,
      role: employee.role,
      id: employee.id
    });

    return NextResponse.json({
      message: exists 
        ? 'Successfully registered and joined organization.'
        : 'Organization and Super Admin created successfully.',
      user: {
        organization_id: resolvedOrgId,
        display_name: displayName,
        email: employee.email,
        role: employee.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during sign up.' },
      { status: 500 }
    );
  }
}
