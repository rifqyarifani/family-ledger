export type AccountDeleteDecision = {
  message: string;
  confirmLabel: string;
  canDelete: boolean;
};

export function formatAccountDeleteMessage(
  name: string,
  transactionCount: number,
  goalCount: number,
  isSavingsAccount: boolean
): AccountDeleteDecision {
  const safeName = name || "this account";
  const parts: string[] = [];
  let canDelete = true;

  if (transactionCount > 0) {
    canDelete = false;
    parts.push(
      `This account has ${transactionCount} linked transaction(s). ` +
        `Reassign or delete them before removing "${safeName}".`
    );
  }

  if (goalCount > 0) {
    if (isSavingsAccount) {
      canDelete = false;
      const goalClause =
        goalCount === 1
          ? `Deleting this account will also delete 1 linked savings goal.`
          : `Deleting this account will also delete ${goalCount} linked savings goals.`;
      return {
        message: `Savings accounts track savings goals. ${goalClause} Please delete the goal${
          goalCount === 1 ? "" : "s"
        } first from the Goals page.`,
        confirmLabel: "OK",
        canDelete: false,
      };
    }

    const goalClause =
      goalCount === 1
        ? `${goalCount} savings goal linked to this account will also be deleted.`
        : `${goalCount} savings goals linked to this account will also be deleted.`;
    parts.push(goalClause);
  }

  if (parts.length === 0) {
    return {
      message: `This will permanently remove "${safeName}". This cannot be undone.`,
      confirmLabel: "Delete",
      canDelete: true,
    };
  }

  if (transactionCount === 0) {
    parts.push(`This action cannot be undone.`);
  }

  return {
    message: parts.join(" "),
    confirmLabel: canDelete ? "Delete anyway" : "OK",
    canDelete,
  };
}

export function formatGoalDeleteMessage(
  goalName: string,
  linkedAccountName: string | null
): string {
  const safeName = goalName || "this savings goal";
  if (linkedAccountName) {
    return `This will remove "${safeName}" (linked to "${linkedAccountName}"). This cannot be undone.`;
  }
  return `This will permanently remove "${safeName}". This cannot be undone.`;
}

export type CategoryDeleteDecision = {
  message: string;
  confirmLabel: string;
};

export function formatCategoryDeleteMessage(
  name: string,
  transactionCount: number,
  budgetCount: number
): CategoryDeleteDecision {
  const safeName = name || "this category";
  const parts: string[] = [];

  if (transactionCount > 0) {
    const txnClause =
      transactionCount === 1
        ? `${transactionCount} transaction will become uncategorized.`
        : `${transactionCount} transactions will become uncategorized.`;
    parts.push(txnClause);
  }

  if (budgetCount > 0) {
    const budgetClause =
      budgetCount === 1
        ? `${budgetCount} budget will lose its target.`
        : `${budgetCount} budgets will lose their target.`;
    parts.push(budgetClause);
  }

  if (parts.length === 0) {
    return {
      message: `This will permanently remove "${safeName}". This cannot be undone.`,
      confirmLabel: "Delete",
    };
  }

  parts.push(`This action cannot be undone.`);

  return {
    message: `This will remove "${safeName}". ${parts.join(" ")}`,
    confirmLabel: "Delete",
  };
}
