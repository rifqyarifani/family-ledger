-- Run this in the Supabase SQL Editor before deploying the matching app code.
-- It upgrades an existing FamilyLedger database without requiring Supabase CLI.

alter table public.households
add column if not exists invite_code text;

do $$
declare
  target_household record;
  generated_code text;
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  index integer;
begin
  for target_household in
    select id
    from public.households
    where invite_code is null or invite_code = ''
  loop
    loop
      generated_code := 'FL-';

      for index in 1..6 loop
        generated_code := generated_code || substr(alphabet, floor(random() * length(alphabet) + 1)::integer, 1);
      end loop;

      exit when not exists (
        select 1
        from public.households
        where invite_code = generated_code
      );
    end loop;

    update public.households
    set invite_code = generated_code
    where id = target_household.id;
  end loop;
end $$;

alter table public.households
alter column invite_code set not null;

create unique index if not exists households_invite_code_key
on public.households(invite_code);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'households_invite_code_format_check'
      and conrelid = 'public.households'::regclass
  ) then
    alter table public.households
    add constraint households_invite_code_format_check
    check (invite_code ~ '^FL-[A-Z2-9]{6}$');
  end if;
end $$;

update public.household_members
set role = 'member'
where role::text in ('admin', 'viewer');

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
using (public.can_manage_household(id));

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

create policy "Owners can delete accounts"
on public.accounts
for delete
to authenticated
using (public.can_manage_household(household_id));

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

create policy "Owners can delete categories"
on public.categories
for delete
to authenticated
using (public.can_manage_household(household_id));

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

create policy "Owners can delete budgets"
on public.budgets
for delete
to authenticated
using (public.can_manage_household(household_id));

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

create policy "Owners can delete savings goals"
on public.savings_goals
for delete
to authenticated
using (public.can_manage_household(household_id));

grant usage on schema public to authenticated, service_role;
grant usage on type public.household_role to authenticated, service_role;
grant usage on type public.account_type to authenticated, service_role;
grant usage on type public.transaction_type to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage on all sequences in schema public to authenticated, service_role;
