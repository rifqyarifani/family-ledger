import { useMemo } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency, formatDate } from "@/lib/finance";
import type {
  Account,
  FamilyMember,
  Transaction,
  TransactionType,
} from "@/types/finance";

function getTransactionTone(type: TransactionType) {
  if (type === "income") return "green";
  if (type === "expense") return "red";
  return "blue";
}

function getAmountPrefix(type: TransactionType) {
  if (type === "income") return "+";
  if (type === "expense") return "-";
  return "";
}

export function TransactionTable({
  transactions,
  members,
  accounts,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  members: FamilyMember[];
  accounts: Account[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}) {
  const memberById = useMemo(() => new Map(members.map((member) => [member.id, member.name])), [members]);
  const accountById = useMemo(() => new Map(accounts.map((account) => [account.id, account.name])), [accounts]);

  function getAccountLabel(transaction: Transaction) {
    const sourceAccount =
      accountById.get(transaction.accountId) ??
      transaction.accountName ??
      "Unknown";
    const destinationAccount = transaction.transferAccountId
      ? (accountById.get(transaction.transferAccountId) ??
        transaction.transferAccountName ??
        "Unknown")
      : "Unknown";

    return transaction.type === "transfer"
      ? `${sourceAccount} -> ${destinationAccount}`
      : sourceAccount;
  }

  function getMemberLabel(transaction: Transaction) {
    return (
      memberById.get(transaction.memberId) ??
      transaction.memberName ??
      "Unknown"
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions found"
        message="Add a record or adjust the filters to see household income and expenses here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle text-xs uppercase tracking-wide text-ink-secondary">
            <tr>
              <th className="px-4 py-3">Transaction</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#cfd5ca] bg-white">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">
                    {transaction.title}
                  </p>
                  {transaction.note ? (
                    <p className="mt-1 text-xs text-ink-secondary">
                      {transaction.note}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 capitalize">
                  <Badge tone={getTransactionTone(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ink-secondary">
                  {transaction.category}
                </td>
                <td className="px-4 py-3 text-ink-secondary">
                  {getMemberLabel(transaction)}
                </td>
                <td className="px-4 py-3 text-ink-secondary">
                  {getAccountLabel(transaction)}
                </td>
                <td className="px-4 py-3 text-ink-secondary">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {getAmountPrefix(transaction.type)}
                  {formatCurrency(transaction.amount)}
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {onEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(transaction)}
                          aria-label={`Edit ${transaction.title}`}
                        >
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : null}
                      {onDelete ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transaction)}
                          aria-label={`Delete ${transaction.title}`}
                        >
                          <Trash2
                            className="h-4 w-4 text-red-600"
                            aria-hidden="true"
                          />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-[#cfd5ca] bg-white md:hidden">
        {transactions.map((transaction) => (
          <article key={transaction.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium text-ink">
                  {transaction.title}
                </h3>
                <p className="mt-1 text-xs text-ink-secondary">
                  {formatDate(transaction.date)} · {transaction.category}
                </p>
              </div>
              <p className="shrink-0 text-right font-semibold text-ink">
                {getAmountPrefix(transaction.type)}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={getTransactionTone(transaction.type)}>
                {transaction.type}
              </Badge>
              <Badge>{getMemberLabel(transaction)}</Badge>
              <Badge>{getAccountLabel(transaction)}</Badge>
            </div>
            {(onEdit || onDelete) && (
              <div className="mt-3 flex justify-end gap-2">
                {onEdit ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                  >
                    Edit
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDelete(transaction)}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
