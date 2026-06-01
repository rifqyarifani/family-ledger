alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members member
    where member.household_id = target_household_id
      and member.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_household(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members member
    where member.household_id = target_household_id
      and member.user_id = auth.uid()
      and member.role = 'owner'
  );
$$;

drop policy if exists "Members can view their households" on public.households;
drop policy if exists "Authenticated users can create households" on public.households;
drop policy if exists "Owners and admins can update households" on public.households;
drop policy if exists "Owners can update households" on public.households;
drop policy if exists "Owners can delete households" on public.households;
drop policy if exists "Members can view household members" on public.household_members;
drop policy if exists "Owners and admins can add members" on public.household_members;
drop policy if exists "Owners can add members" on public.household_members;
drop policy if exists "Users can add their first membership" on public.household_members;
drop policy if exists "Owners and admins can update members" on public.household_members;
drop policy if exists "Owners can update members" on public.household_members;
drop policy if exists "Owners and admins can remove members" on public.household_members;
drop policy if exists "Owners can remove members" on public.household_members;
drop policy if exists "Members can view accounts" on public.accounts;
drop policy if exists "Members can create accounts" on public.accounts;
drop policy if exists "Members can update accounts" on public.accounts;
drop policy if exists "Owners and admins can delete accounts" on public.accounts;
drop policy if exists "Owners can delete accounts" on public.accounts;
drop policy if exists "Members can view categories" on public.categories;
drop policy if exists "Members can create categories" on public.categories;
drop policy if exists "Members can update categories" on public.categories;
drop policy if exists "Owners and admins can delete categories" on public.categories;
drop policy if exists "Owners can delete categories" on public.categories;
drop policy if exists "Members can view transactions" on public.transactions;
drop policy if exists "Members can create transactions" on public.transactions;
drop policy if exists "Members can update transactions" on public.transactions;
drop policy if exists "Members can delete transactions" on public.transactions;
drop policy if exists "Members can view budgets" on public.budgets;
drop policy if exists "Members can create budgets" on public.budgets;
drop policy if exists "Members can update budgets" on public.budgets;
drop policy if exists "Owners and admins can delete budgets" on public.budgets;
drop policy if exists "Owners can delete budgets" on public.budgets;
drop policy if exists "Members can view savings goals" on public.savings_goals;
drop policy if exists "Members can create savings goals" on public.savings_goals;
drop policy if exists "Members can update savings goals" on public.savings_goals;
drop policy if exists "Owners and admins can delete savings goals" on public.savings_goals;
drop policy if exists "Owners can delete savings goals" on public.savings_goals;

create policy "Members can view their households"
on public.households
for select
to authenticated
using (public.is_household_member(id));
-- IMPORTANT: must reference "id" (household UUID), NOT "created_by" (user UUID).
-- The is_household_member() function expects a household_id and searches
-- household_members.household_id. Passing a user UUID (from created_by)
-- would never match and would silently block all reads.

create policy "Authenticated users can create households"
on public.households
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Owners can update households"
on public.households
for update
to authenticated
using (public.can_manage_household(id))
with check (public.can_manage_household(id));

create policy "Owners can delete households"
on public.households
for delete
to authenticated
using (
  exists (
    select 1
    from public.household_members member
    where member.household_id = households.id
      and member.user_id = auth.uid()
      and member.role = 'owner'
  )
);

create policy "Members can view household members"
on public.household_members
for select
to authenticated
using (public.is_household_member(household_id));

create policy "Owners can add members"
on public.household_members
for insert
to authenticated
with check (public.can_manage_household(household_id));

create policy "Owners can update members"
on public.household_members
for update
to authenticated
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

create policy "Owners can remove members"
on public.household_members
for delete
to authenticated
using (public.can_manage_household(household_id));

create policy "Members can view accounts"
on public.accounts
for select
to authenticated
using (public.is_household_member(household_id));

create policy "Members can create accounts"
on public.accounts
for insert
to authenticated
with check (public.is_household_member(household_id));

create policy "Members can update accounts"
on public.accounts
for update
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Members can delete accounts"
on public.accounts
for delete
to authenticated
using (public.is_household_member(household_id));

create policy "Members can view categories"
on public.categories
for select
to authenticated
using (public.is_household_member(household_id));

create policy "Members can create categories"
on public.categories
for insert
to authenticated
with check (public.is_household_member(household_id));

create policy "Members can update categories"
on public.categories
for update
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Members can delete categories"
on public.categories
for delete
to authenticated
using (public.is_household_member(household_id));

create policy "Members can view transactions"
on public.transactions
for select
to authenticated
using (public.is_household_member(household_id));

create policy "Members can create transactions"
on public.transactions
for insert
to authenticated
with check (public.is_household_member(household_id));

create policy "Members can update transactions"
on public.transactions
for update
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Members can delete transactions"
on public.transactions
for delete
to authenticated
using (public.is_household_member(household_id));

create policy "Members can view budgets"
on public.budgets
for select
to authenticated
using (public.is_household_member(household_id));

create policy "Members can create budgets"
on public.budgets
for insert
to authenticated
with check (public.is_household_member(household_id));

create policy "Members can update budgets"
on public.budgets
for update
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Members can delete budgets"
on public.budgets
for delete
to authenticated
using (public.is_household_member(household_id));

create policy "Members can view savings goals"
on public.savings_goals
for select
to authenticated
using (public.is_household_member(household_id));

create policy "Members can create savings goals"
on public.savings_goals
for insert
to authenticated
with check (public.is_household_member(household_id));

create policy "Members can update savings goals"
on public.savings_goals
for update
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Members can delete savings goals"
on public.savings_goals
for delete
to authenticated
using (public.is_household_member(household_id));
