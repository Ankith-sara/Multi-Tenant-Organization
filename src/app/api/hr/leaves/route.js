import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { canAccessDepartment, isManagerRole } from '@/lib/roles';
import {
  ensureDepartmentTables,
  listHrLeaveRequests,
  listHrLeaveRequestsForEmployee,
  createHrLeaveRequest,
  updateHrLeaveStatus,
} from '@/lib/db';

async function authenticate(departmentKey) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized. Please log in.', status: 401 };
  }
  if (departmentKey && !canAccessDepartment(session.role, departmentKey)) {
    return { error: 'Forbidden. You do not have access to this department.', status: 403 };
  }
  return { session };
}

// GET: list leave requests.
// Managers/admins see the whole organization's requests.
// Non-managers only see their own.
export async function GET() {
  try {
    const auth = await authenticate('hr');
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organization_id, role, id } = auth.session;
    await ensureDepartmentTables(organization_id);

    const leaves = isManagerRole(role)
      ? await listHrLeaveRequests(organization_id)
      : await listHrLeaveRequestsForEmployee(organization_id, id);

    return NextResponse.json({ leaves }, { status: 200 });
  } catch (error) {
    console.error('List leave requests error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching leave requests.' }, { status: 500 });
  }
}

// POST: any employee with HR department access can file their own leave request.
export async function POST(request) {
  try {
    const auth = await authenticate('hr');
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organization_id, id } = auth.session;
    await ensureDepartmentTables(organization_id);

    const { leaveType, startDate, endDate } = await request.json();
    if (!leaveType || !startDate || !endDate) {
      return NextResponse.json({ error: 'leaveType, startDate, and endDate are required.' }, { status: 400 });
    }

    const leave = await createHrLeaveRequest(organization_id, {
      employeeId: id,
      leaveType,
      startDate,
      endDate,
    });

    return NextResponse.json({ message: 'Leave request submitted.', leave }, { status: 201 });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json({ error: 'An error occurred while submitting the leave request.' }, { status: 500 });
  }
}

// PATCH: managers/admins approve or reject a leave request.
export async function PATCH(request) {
  try {
    const auth = await authenticate('hr');
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organization_id, role, id } = auth.session;

    if (!isManagerRole(role)) {
      return NextResponse.json({ error: 'Forbidden. Only HR managers or admins can review leave requests.' }, { status: 403 });
    }

    const { leaveId, status } = await request.json();
    if (!leaveId || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'leaveId and a valid status (Approved/Rejected) are required.' }, { status: 400 });
    }

    const updated = await updateHrLeaveStatus(organization_id, leaveId, status, id);
    if (!updated) {
      return NextResponse.json({ error: 'Leave request not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Leave request updated.', leave: updated }, { status: 200 });
  } catch (error) {
    console.error('Update leave request error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the leave request.' }, { status: 500 });
  }
}
