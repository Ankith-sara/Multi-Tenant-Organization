import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { canAccessDepartment } from '@/lib/roles';
import { ensureDepartmentTables, listTransactions, createTransaction, updateTransactionStatus } from '@/lib/db';

async function authenticate() {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized. Please log in.', status: 401 };
  }
  if (!canAccessDepartment(session.role, 'accounts')) {
    return { error: 'Forbidden. You do not have access to Accounts.', status: 403 };
  }
  return { session };
}

export async function GET() {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await ensureDepartmentTables(auth.session.organization_id);

    const transactions = await listTransactions(auth.session.organization_id);
    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error('List transactions error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching transactions.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await ensureDepartmentTables(auth.session.organization_id);

    const { clientName, amount, status } = await request.json();
    if (!clientName) {
      return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
    }

    const transaction = await createTransaction(auth.session.organization_id, {
      clientName,
      amount: parseFloat(amount) || 0,
      status: status || 'Unpaid',
    });

    return NextResponse.json({ message: 'Transaction added.', transaction }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the transaction.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { transactionId, status } = await request.json();
    if (!transactionId || !status) {
      return NextResponse.json({ error: 'transactionId and status are required.' }, { status: 400 });
    }

    const updated = await updateTransactionStatus(auth.session.organization_id, transactionId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction updated.', transaction: updated }, { status: 200 });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the transaction.' }, { status: 500 });
  }
}
