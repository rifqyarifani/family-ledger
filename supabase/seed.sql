-- Demo seed data for local Supabase development.
-- Replace the user IDs with real auth.users IDs before running this file.

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  demo_household_id uuid := '10000000-0000-0000-0000-000000000001';
  rifqy_member_id uuid := '20000000-0000-0000-0000-000000000001';
  ayu_member_id uuid := '20000000-0000-0000-0000-000000000002';
  cash_account_id uuid := '30000000-0000-0000-0000-000000000001';
  bca_account_id uuid := '30000000-0000-0000-0000-000000000002';
  emergency_account_id uuid := '30000000-0000-0000-0000-000000000003';
  salary_category_id uuid := '40000000-0000-0000-0000-000000000001';
  food_category_id uuid := '40000000-0000-0000-0000-000000000002';
  savings_category_id uuid := '40000000-0000-0000-0000-000000000003';
begin
  insert into public.households (id, name, invite_code, currency, monthly_cycle_day, created_by)
  values (demo_household_id, 'FamilyLedger Home', 'DEMO24', 'IDR', 1, demo_user_id)
  on conflict (id) do nothing;

  insert into public.household_members (id, household_id, user_id, role, display_name, email, monthly_responsibility_note)
  values
    (rifqy_member_id, demo_household_id, demo_user_id, 'owner', 'Rifqy', 'rifqy@example.com', 'Monthly income and household review'),
    (ayu_member_id, demo_household_id, '00000000-0000-0000-0000-000000000002', 'member', 'Ayu', 'ayu@example.com', 'Bills, groceries, and education planning')
  on conflict (household_id, user_id) do nothing;

  insert into public.accounts (id, household_id, name, type, opening_balance, created_by)
  values
    (cash_account_id, demo_household_id, 'Cash', 'cash', 1500000, demo_user_id),
    (bca_account_id, demo_household_id, 'BCA Main', 'bank', 18500000, demo_user_id),
    (emergency_account_id, demo_household_id, 'Emergency Fund', 'savings', 22000000, demo_user_id)
  on conflict (id) do nothing;

  insert into public.categories (id, household_id, name, type, color, created_by)
  values
    (salary_category_id, demo_household_id, 'Salary', 'income', '#16a34a', demo_user_id),
    (food_category_id, demo_household_id, 'Food & Groceries', 'expense', '#2563eb', demo_user_id),
    (savings_category_id, demo_household_id, 'Savings', 'expense', '#0f172a', demo_user_id)
  on conflict (household_id, name, type) do nothing;

  insert into public.transactions (
    household_id,
    title,
    type,
    amount,
    category_id,
    member_id,
    account_id,
    transaction_date,
    note,
    created_by
  )
  values
    (demo_household_id, 'Monthly salary', 'income', 22000000, salary_category_id, rifqy_member_id, bca_account_id, '2026-05-01', 'Main household income', demo_user_id),
    (demo_household_id, 'Groceries', 'expense', 1850000, food_category_id, ayu_member_id, cash_account_id, '2026-05-07', null, demo_user_id);

  insert into public.budgets (household_id, category_id, budget_month, limit_amount, created_by)
  values (demo_household_id, food_category_id, '2026-05-01', 5500000, demo_user_id)
  on conflict (household_id, category_id, budget_month) do nothing;

  insert into public.savings_goals (household_id, name, target_amount, saved_amount, due_date, account_id, created_by)
  values (demo_household_id, 'Emergency Fund', 60000000, 25000000, '2026-12-31', emergency_account_id, demo_user_id)
  on conflict do nothing;
end $$;
