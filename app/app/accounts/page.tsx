import { createClient } from "@/src/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { AccountsClient } from "@/app/app/accounts/accounts-client";
import {
  getAccountBalanceMap,
  getAccountImpact,
  getAccounts,
  type AccountImpact
} from "@/src/lib/data/accounts";
import { getHouseholdMembers } from "@/src/lib/data/household-members";

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

  const [accounts, accountBalances, members] = await Promise.all([
    getAccounts(householdId),
    getAccountBalanceMap(householdId),
    getHouseholdMembers(householdId),
  ]);

  const impacts = await Promise.all(
    accounts.map((account) => getAccountImpact(householdId, account.id))
  );
  const accountImpacts: Record<string, AccountImpact> = {};
  for (let i = 0; i < accounts.length; i += 1) {
    accountImpacts[accounts[i].id] = impacts[i];
  }

  return (
    <AccountsClient
      accounts={accounts}
      accountBalances={accountBalances}
      accountImpacts={accountImpacts}
      members={members}
    />
  );
}
