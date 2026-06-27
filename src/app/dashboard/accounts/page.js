import { DollarSign } from 'lucide-react';
import { requireDepartmentAccess } from '@/lib/auth-guard';
import { ensureDepartmentTables, listTransactions } from '@/lib/db';
import TransactionsBoard from './TransactionsBoard';

export default async function AccountsPage() {
  const session = await requireDepartmentAccess('accounts');
  await ensureDepartmentTables(session.organization_id);
  const transactions = await listTransactions(session.organization_id);

  const revenue = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const paidCount = transactions.filter((t) => t.status === 'Paid').length;
  const paidRate = transactions.length > 0
    ? ((paidCount / transactions.length) * 100).toFixed(0)
    : '0';

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Revenue Collected</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">${revenue.toLocaleString()}</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Ledger Invoices</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none">{transactions.length} total</div>
        </div>
        <div className="p-6 rounded-[12px] border border-dashed border-cork-shadow bg-transparent">
          <span className="text-[10px] text-grey-brown uppercase tracking-wider font-semibold">Paid Rate</span>
          <div className="text-[29px] text-warm-cream font-medium mt-1 leading-none text-burnt-sienna">{paidRate}%</div>
        </div>
      </div>

      <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
        <h2 className="text-[18px] font-medium mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-burnt-sienna" />
          Ledger Transaction Invoices
        </h2>
        <TransactionsBoard initialTransactions={transactions} />
      </div>
    </div>
  );
}
