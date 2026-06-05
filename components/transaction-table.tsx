import { Fragment, useMemo, useRef, useState } from "react";
import { MoreVertical, Tag } from "lucide-react";
import { iconLookup } from "@/constants/icons";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatTime } from "@/lib/finance";
import type {
  Account,
  FamilyMember,
  Transaction,
  TransactionType,
} from "@/types/finance";

function getAmountPrefix(type: TransactionType) {
  if (type === "income") return "+";
  if (type === "expense") return "-";
  return "";
}

function getAmountColor(type: TransactionType) {
  if (type === "income") return "text-emerald-600";
  if (type === "expense") return "text-danger";
  return "text-blue-600";
}

function getFirstName(fullName: string) {
  return fullName.split(" ")[0] ?? fullName;
}

type TransactionTableProps = {
  transactions: Transaction[];
  members: FamilyMember[];
  accounts: Account[];
  categoryMap?: Record<string, { icon?: string; color?: string }>;
  accountMap?: Record<string, { iconColor?: string }>;
  showMember?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
};

export function TransactionTable({
  transactions,
  members,
  accounts,
  categoryMap = {},
  accountMap = {},
  showMember = true,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const memberById = useMemo(() => new Map(members.map((member) => [member.id, member.name])), [members]);

  useClickOutside(menuRef, openMenuId !== null, () => setOpenMenuId(null));
  const hasActions = Boolean(onEdit || onDelete);
  const tableColumnCount = 5 + (showMember ? 1 : 0) + (hasActions ? 1 : 0);

  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const transaction of transactions) {
      const dateKey = transaction.date;
      const existing = groups.get(dateKey) ?? [];
      existing.push(transaction);
      groups.set(dateKey, existing);
    }
    for (const rows of groups.values()) {
      rows.sort((a, b) => {
        if (a.time && b.time) {
          const byTime = b.time.localeCompare(a.time);
          if (byTime !== 0) return byTime;
        } else if (a.time) {
          return -1;
        } else if (b.time) {
          return 1;
        }
        const byCreated = b.createdAt.localeCompare(a.createdAt);
        if (byCreated !== 0) return byCreated;
        return b.id.localeCompare(a.id);
      });
    }
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);

  function getAccountLabel(transaction: Transaction) {
    const account = accounts.find((a) => a.id === transaction.accountId);
    if (transaction.type === "transfer") {
      const destAccount = accounts.find((a) => a.id === transaction.transferAccountId);
      return `${account?.name ?? "Unknown"} → ${destAccount?.name ?? "Unknown"}`;
    }
    return account?.name ?? transaction.accountName ?? "Unknown";
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
    <div className="rounded-2xl border border-surface-border">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle text-xs uppercase tracking-wide text-ink-secondary">
            <tr>
              <th scope="col" className="px-4 py-3">Transaction</th>
              <th scope="col" className="px-4 py-3">Category</th>
              {showMember ? (
                <th scope="col" className="px-4 py-3">Member</th>
              ) : null}
              <th scope="col" className="px-4 py-3">Account</th>
              <th scope="col" className="px-4 py-3">Time</th>
              <th scope="col" className="px-4 py-3 text-right">Amount</th>
              {hasActions ? <th scope="col" className="px-4 py-3" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-white">
            {groupedTransactions.map(([dateKey, dateTransactions]) => (
              <Fragment key={dateKey}>
                <tr key={`date-${dateKey}`}>
                  <td
                    colSpan={tableColumnCount}
                    className="bg-surface-subtle px-4 py-2 text-xs font-semibold text-ink-secondary"
                  >
                    {formatDate(dateKey)}
                  </td>
                </tr>
                {dateTransactions.map((transaction) => {
                  const menuOpen = openMenuId === transaction.id;
                  const catInfo = categoryMap[transaction.category];
                  const CategoryIcon = catInfo?.icon ? (iconLookup[catInfo.icon] ?? iconLookup.tag) : iconLookup.tag;
                  const catColor = catInfo?.color ?? "#64748b";
                  const accInfo = accountMap[transaction.accountId];
                  const accColor = accInfo?.iconColor ?? "#64748b";

                  return (
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white"
                            style={{ backgroundColor: catColor }}
                          >
                            <CategoryIcon className="h-3 w-3" aria-hidden="true" />
                          </div>
                          <span className="text-ink-secondary">{transaction.category}</span>
                        </div>
                      </td>
                      {showMember ? (
                        <td className="px-4 py-3 text-ink-secondary">
                          {getFirstName(getMemberLabel(transaction))}
                        </td>
                      ) : null}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: accColor }}
                          />
                          <span className="text-ink-secondary">{getAccountLabel(transaction)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {formatTime(transaction.time ?? "")}
                      </td>
                      <td className={cn(
                        "px-4 py-3 text-right font-semibold",
                        getAmountColor(transaction.type)
                      )}>
                        {getAmountPrefix(transaction.type)}
                        {formatCurrency(transaction.amount)}
                      </td>
                      {hasActions && (
                        <td className="px-4 py-3">
                          <div className="relative flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setOpenMenuId(menuOpen ? null : transaction.id)}
                              aria-expanded={menuOpen}
                              aria-haspopup="true"
                              aria-label={`Actions for ${transaction.title}`}
                            >
                              <MoreVertical className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            {menuOpen ? (
                              <div
                                ref={menuRef}
                                role="menu"
                                aria-label={`Actions for ${transaction.title}`}
                                onKeyDown={(event) => {
                                  if (event.key === "Escape") {
                                    setOpenMenuId(null);
                                  }
                                }}
                                className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-surface-border bg-white shadow-lg"
                              >
                                {onEdit ? (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="flex w-full items-center px-4 py-2 text-left text-sm text-ink transition hover:bg-surface-subtle"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onEdit(transaction);
                                    }}
                                  >
                                    Edit
                                  </button>
                                ) : null}
                                {onDelete ? (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="flex w-full items-center px-4 py-2 text-left text-sm text-danger transition hover:bg-danger-light"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onDelete(transaction);
                                    }}
                                  >
                                    Delete
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden">
        {groupedTransactions.map(([dateKey, dateTransactions]) => (
          <div key={`date-${dateKey}`}>
            <div className="bg-surface-subtle px-4 py-2 text-xs font-semibold text-ink-secondary">
              {formatDate(dateKey)}
            </div>
            <div className="divide-y divide-surface-border bg-white">
              {dateTransactions.map((transaction) => {
                const menuOpen = openMenuId === transaction.id;
                const catInfo = categoryMap[transaction.category];
                const CategoryIcon = catInfo?.icon ? (iconLookup[catInfo.icon] ?? Tag) : Tag;
                const catColor = catInfo?.color ?? "#64748b";
                const accInfo = accountMap[transaction.accountId];
                const accColor = accInfo?.iconColor ?? "#64748b";

                return (
                  <article key={transaction.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-medium text-ink">
                          {transaction.title}
                        </h3>
                      </div>
                      <p className={cn(
                        "shrink-0 text-right font-semibold",
                        getAmountColor(transaction.type)
                      )}>
                        {getAmountPrefix(transaction.type)}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-ink-secondary">
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
                          style={{ backgroundColor: catColor }}
                        >
                          <CategoryIcon className="h-3 w-3" aria-hidden="true" />
                        </div>
                        <span>{transaction.category}</span>
                        {showMember ? (
                          <>
                            <span>·</span>
                            <span>{getFirstName(getMemberLabel(transaction))}</span>
                          </>
                        ) : null}
                        <span>·</span>
                        <span
                          className="inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: accColor }}
                        />
                        <span>{getAccountLabel(transaction)}</span>
                        <span>·</span>
                        <span>{formatTime(transaction.time ?? "")}</span>
                      </div>
                      {hasActions && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpenMenuId(menuOpen ? null : transaction.id)}
                            aria-expanded={menuOpen}
                            aria-haspopup="true"
                            aria-label={`Actions for ${transaction.title}`}
                          >
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          {menuOpen ? (
                            <div
                              ref={menuRef}
                              role="menu"
                              aria-label={`Actions for ${transaction.title}`}
                              onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                  setOpenMenuId(null);
                                }
                              }}
                              className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-surface-border bg-white shadow-lg"
                            >
                              {onEdit ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="flex w-full items-center px-4 py-2 text-left text-sm text-ink transition hover:bg-surface-subtle"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onEdit(transaction);
                                  }}
                                >
                                  Edit
                                </button>
                              ) : null}
                              {onDelete ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="flex w-full items-center px-4 py-2 text-left text-sm text-danger transition hover:bg-danger-light"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onDelete(transaction);
                                  }}
                                >
                                  Delete
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
