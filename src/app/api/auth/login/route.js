import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { checkOrganizationExists, getEmployeeByEmail, sanitizeOrgId, getOrganizationDetails } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST(request) {
  try {
    const { organization_id, email, password } = await request.json();

    // 1. Validation
    if (!organization_id || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // 2. Check if organization exists in master db
    const orgExists = await checkOrganizationExists(organization_id);
    if (!orgExists) {
      return NextResponse.json(
        { error: 'Organization not found. Please register first.' },
        { status: 404 }
      );
    }

    // 3. Retrieve employee from organization's employee table
    const employee = await getEmployeeByEmail(organization_id, email);
    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(password, employee.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 5. Establish session cookie
    const safeOrgId = sanitizeOrgId(organization_id);
    const orgDetails = await getOrganizationDetails(organization_id);
    const displayName = (orgDetails && orgDetails.display_name) ? orgDetails.display_name : organization_id;

    await setSession({
      organization_id: safeOrgId,
      display_name: displayName,
      email: employee.email,
      role: employee.role,
      id: employee.id
    });

    return NextResponse.json({
      message: 'Logged in successfully.',
      user: {
        organization_id: safeOrgId,
        display_name: displayName,
        email: employee.email,
        role: employee.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during login.' },
      { status: 500 }
    );
  }
}
