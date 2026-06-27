import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { canAccessDepartment } from '@/lib/roles';
import { ensureDepartmentTables, listOpsTasks, createOpsTask, updateOpsTaskProgress } from '@/lib/db';

async function authenticate() {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized. Please log in.', status: 401 };
  }
  if (!canAccessDepartment(session.role, 'operations')) {
    return { error: 'Forbidden. You do not have access to Operations.', status: 403 };
  }
  return { session };
}

export async function GET() {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await ensureDepartmentTables(auth.session.organization_id);

    const tasks = await listOpsTasks(auth.session.organization_id);
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('List ops tasks error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching tasks.' }, { status: 500 });
  }
}

// POST: trigger a new background task (starts at 0% / Running)
export async function POST(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await ensureDepartmentTables(auth.session.organization_id);

    const { name, node } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Task name is required.' }, { status: 400 });
    }

    const task = await createOpsTask(auth.session.organization_id, { name, node });
    return NextResponse.json({ message: 'Task triggered.', task }, { status: 201 });
  } catch (error) {
    console.error('Create ops task error:', error);
    return NextResponse.json({ error: 'An error occurred while triggering the task.' }, { status: 500 });
  }
}

// PATCH: update progress/status (used by the client to advance a running task)
export async function PATCH(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { taskId, progress, status } = await request.json();
    if (!taskId || progress === undefined || !status) {
      return NextResponse.json({ error: 'taskId, progress, and status are required.' }, { status: 400 });
    }

    const updated = await updateOpsTaskProgress(auth.session.organization_id, taskId, progress, status);
    if (!updated) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task updated.', task: updated }, { status: 200 });
  } catch (error) {
    console.error('Update ops task error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the task.' }, { status: 500 });
  }
}
