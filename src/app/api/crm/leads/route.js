import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { canAccessDepartment } from '@/lib/roles';
import { ensureDepartmentTables, listCrmLeads, createCrmLead, updateCrmLeadStatus } from '@/lib/db';

async function authenticate() {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized. Please log in.', status: 401 };
  }
  if (!canAccessDepartment(session.role, 'crm')) {
    return { error: 'Forbidden. You do not have access to CRM.', status: 403 };
  }
  return { session };
}

export async function GET() {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await ensureDepartmentTables(auth.session.organization_id);

    const leads = await listCrmLeads(auth.session.organization_id);
    return NextResponse.json({ leads }, { status: 200 });
  } catch (error) {
    console.error('List CRM leads error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching leads.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await ensureDepartmentTables(auth.session.organization_id);

    const { name, email, value, status } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Lead name is required.' }, { status: 400 });
    }

    const lead = await createCrmLead(auth.session.organization_id, {
      name,
      email,
      value: parseFloat(value) || 0,
      status: status || 'New',
      ownerId: auth.session.id,
    });

    return NextResponse.json({ message: 'Lead added.', lead }, { status: 201 });
  } catch (error) {
    console.error('Create CRM lead error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the lead.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { leadId, status } = await request.json();
    if (!leadId || !status) {
      return NextResponse.json({ error: 'leadId and status are required.' }, { status: 400 });
    }

    const updated = await updateCrmLeadStatus(auth.session.organization_id, leadId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lead updated.', lead: updated }, { status: 200 });
  } catch (error) {
    console.error('Update CRM lead error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the lead.' }, { status: 500 });
  }
}
