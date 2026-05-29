import { createClient } from "@/src/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { AccountsClient } from "@/app/app/accounts/accounts-client";
import { getAccountBalanceMap, getAccounts } from "@/src/lib/data/accounts";

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <EmptyState title="No household found" message="Create a household before managing accounts." />;
  }

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<{ household_id: string }>();

  if (!member) {
    return <EmptyState title="No household found" message="Create a household before managing accounts." />;
  }

  const householdId = member.household_id;

  const [accounts, accountBalances] = await Promise.all([
    getAccounts(householdId),
    getAccountBalanceMap(householdId),
  ]);

  return <AccountsClient accounts={accounts} accountBalances={accountBalances} householdId={householdId} />;
}
