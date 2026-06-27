import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { canAccessDepartment } from '@/lib/roles';
import { ensureDepartmentTables, listProperties, createProperty, updatePropertyStatus } from '@/lib/db';

async function authenticate() {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized. Please log in.', status: 401 };
  }
  if (!canAccessDepartment(session.role, 'property')) {
    return { error: 'Forbidden. You do not have access to Property.', status: 403 };
  }
  return { session };
}

export async function GET() {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await ensureDepartmentTables(auth.session.organization_id);

    const properties = await listProperties(auth.session.organization_id);
    return NextResponse.json({ properties }, { status: 200 });
  } catch (error) {
    console.error('List properties error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching properties.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await ensureDepartmentTables(auth.session.organization_id);

    const { name, propertyType, rent, status } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Property name is required.' }, { status: 400 });
    }

    const property = await createProperty(auth.session.organization_id, {
      name,
      propertyType,
      rent: parseFloat(rent) || 0,
      status: status || 'Vacant',
    });

    return NextResponse.json({ message: 'Property added.', property }, { status: 201 });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json({ error: 'An error occurred while adding the property.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { propertyId, status } = await request.json();
    if (!propertyId || !status) {
      return NextResponse.json({ error: 'propertyId and status are required.' }, { status: 400 });
    }

    const updated = await updatePropertyStatus(auth.session.organization_id, propertyId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Property updated.', property: updated }, { status: 200 });
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the property.' }, { status: 500 });
  }
}
