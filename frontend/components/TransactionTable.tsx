import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const HEADER_CELL = "px-4 py-3 text-left text-xs font-medium text-slate-500";

export default function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className={HEADER_CELL}>Date</th>
            <th className={HEADER_CELL}>Description</th>
            <th className={HEADER_CELL}>Category</th>
            <th className={HEADER_CELL}>Type</th>
            <th className={`${HEADER_CELL} text-right`}>Amount</th>
            <th className={`${HEADER_CELL} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "income";
            return (
              <tr key={transaction.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-500">{formatDate(transaction.date)}</td>
                <td className="px-4 py-3 font-medium">{transaction.description}</td>
                <td className="px-4 py-3 text-slate-600">{transaction.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {isIncome ? "Income" : "Expense"}
                  </span>
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums ${
                    isIncome ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isIncome ? "+" : "−"}
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(transaction)}
                    aria-label={`Edit ${transaction.description}`}
                    className="rounded px-2 py-1 font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(transaction)}
                    aria-label={`Delete ${transaction.description}`}
                    className="rounded px-2 py-1 font-medium text-rose-600 hover:text-rose-800 focus-visible:outline-2 focus-visible:outline-rose-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
