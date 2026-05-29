import { createClient } from "@/src/lib/supabase/server";
import type { SavingsGoal } from "@/types/finance";

type SavingsGoalRow = {
  id: string;
  name: string;
  target_amount: number | string;
  saved_amount: number | string;
  due_date: string | null;
  account_id: string;
};

export type SavingsGoalInput = {
  name: string;
  targetAmount: number;
  savedAmount: number;
  dueDate: string;
  accountId: string;
};

function mapSavingsGoal(row: SavingsGoalRow): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    savedAmount: Number(row.saved_amount),
    dueDate: row.due_date ?? "",
    accountId: row.account_id
  };
}

export async function getSavingsGoals(householdId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, saved_amount, due_date, account_id")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true })
    .returns<SavingsGoalRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapSavingsGoal);
}

export async function createSavingsGoal(householdId: string, goal: SavingsGoalInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("savings_goals").insert({
    household_id: householdId,
    name: goal.name,
    target_amount: goal.targetAmount,
    saved_amount: goal.savedAmount,
    due_date: goal.dueDate,
    account_id: goal.accountId
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSavingsGoal(householdId: string, goalId: string, goal: SavingsGoalInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("savings_goals")
    .update({
      name: goal.name,
      target_amount: goal.targetAmount,
      saved_amount: goal.savedAmount,
      due_date: goal.dueDate,
      account_id: goal.accountId
    })
    .eq("household_id", householdId)
    .eq("id", goalId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteSavingsGoal(householdId: string, goalId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("household_id", householdId)
    .eq("id", goalId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Savings goal was not found or could not be deleted.");
  }
}
