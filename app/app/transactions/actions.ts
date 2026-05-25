"use server";

import { revalidatePath } from "next/cache";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  type TransactionInput
} from "@/src/lib/data/transactions";
import { getActiveHousehold } from "@/src/lib/data/households";
import type { Transaction } from "@/types/finance";

function validateTransaction(transaction: Transaction): TransactionInput {
  const title = transaction.title.trim();
  const category = transaction.category.trim();
  const note = transaction.note?.trim();
  const isTransfer = transaction.type === "transfer";

  if (!title || title.length > 30) {
    throw new Error("Title must be 1-30 characters.");
  }

  if (transaction.type !== "income" && transaction.type !== "expense" && transaction.type !== "transfer") {
    throw new Error("Transaction type must be income, expense, or transfer.");
  }

  if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
    throw new Error("Amount must be positive.");
  }

  if (!transaction.date) {
    throw new Error("Date is required.");
  }

  if (!transaction.accountId) {
    throw new Error("Choose an account.");
  }

  if (!isTransfer && !category) {
    throw new Error("Choose a category.");
  }

  if (isTransfer && !transaction.transferAccountId) {
    throw new Error("Choose a destination account.");
  }

  if (isTransfer && transaction.transferAccountId === transaction.accountId) {
    throw new Error("Choose a different destination account.");
  }

  if (!transaction.memberId) {
    throw new Error("Choose a family member.");
  }

  return {
    title,
    type: transaction.type,
    amount: transaction.amount,
    category: isTransfer ? undefined : category,
    memberId: transaction.memberId,
    accountId: transaction.accountId,
    transferAccountId: isTransfer ? transaction.transferAccountId : undefined,
    date: transaction.date,
    note
  };
}

async function requireHouseholdId() {
  const household = await getActiveHousehold();

  if (!household) {
    throw new Error("No active household found.");
  }

  return household.id;
}

function revalidateTransactionViews() {
  revalidatePath("/app");
  revalidatePath("/app/accounts");
  revalidatePath("/app/budget");
  revalidatePath("/app/goals");
  revalidatePath("/app/transactions");
  revalidatePath("/app/reports");
}

export async function createTransactionAction(transaction: Transaction) {
  const householdId = await requireHouseholdId();
  await createTransaction(householdId, validateTransaction(transaction));
  revalidateTransactionViews();
}

export async function updateTransactionAction(transaction: Transaction) {
  const householdId = await requireHouseholdId();
  await updateTransaction(householdId, transaction.id, validateTransaction(transaction));
  revalidateTransactionViews();
}

export async function deleteTransactionAction(transactionId: string) {
  const householdId = await requireHouseholdId();
  await deleteTransaction(householdId, transactionId);
  revalidateTransactionViews();
}
