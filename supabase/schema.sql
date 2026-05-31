create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  create type public.household_role as enum ('owner', 'member');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.account_type as enum ('cash', 'bank', 'credit', 'savings', 'other');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.transaction_type as enum ('income', 'expense', 'transfer');
exception when duplicate_object then null;
end $$;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  invite_code text not null unique check (invite_code ~ '^[A-Z2-9]{6}$'),
  currency text not null default 'IDR' check (currency = 'IDR'),
  monthly_cycle_day integer not null default 1 check (monthly_cycle_day between 1 and 31),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.household_role not null default 'member',
  display_name text not null check (char_length(display_name) between 1 and 80),
  email text,
  monthly_responsibility_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  type public.account_type not null default 'bank',
  opening_balance numeric(14, 2) not null default 0,
  icon_color text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  type public.transaction_type not null,
  color text,
  icon text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, name, type)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 30),
  type public.transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  member_id uuid references public.household_members(id) on delete set null,
  account_id uuid not null references public.accounts(id) on delete restrict,
  transfer_account_id uuid references public.accounts(id) on delete restrict,
  transaction_date date not null,
  transaction_time time,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_destination_required check (
    (type = 'transfer' and transfer_account_id is not null and transfer_account_id <> account_id)
    or (type <> 'transfer' and transfer_account_id is null)
  )
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  budget_month date not null,
  limit_amount numeric(14, 2) not null default 0 check (limit_amount >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, category_id, budget_month)
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  target_amount numeric(14, 2) not null default 0 check (target_amount >= 0),
  saved_amount numeric(14, 2) not null default 0 check (saved_amount >= 0),
  due_date date,
  account_id uuid not null references public.accounts(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists household_members_household_id_idx on public.household_members(household_id);
create index if not exists household_members_user_id_idx on public.household_members(user_id);
create index if not exists accounts_household_id_idx on public.accounts(household_id);
create index if not exists categories_household_id_idx on public.categories(household_id);
create index if not exists transactions_household_date_idx on public.transactions(household_id, transaction_date desc);
create index if not exists transactions_account_id_idx on public.transactions(account_id);
create index if not exists transactions_transfer_account_id_idx on public.transactions(transfer_account_id);
create index if not exists budgets_household_month_idx on public.budgets(household_id, budget_month);
create index if not exists savings_goals_household_id_idx on public.savings_goals(household_id);

drop trigger if exists households_set_updated_at on public.households;

create trigger households_set_updated_at
before update on public.households
for each row execute function public.set_updated_at();

drop trigger if exists household_members_set_updated_at on public.household_members;

create trigger household_members_set_updated_at
before update on public.household_members
for each row execute function public.set_updated_at();

drop trigger if exists accounts_set_updated_at on public.accounts;

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

drop trigger if exists budgets_set_updated_at on public.budgets;

create trigger budgets_set_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

drop trigger if exists savings_goals_set_updated_at on public.savings_goals;

create trigger savings_goals_set_updated_at
before update on public.savings_goals
for each row execute function public.set_updated_at();

create or replace function public.get_account_balances(target_household_id uuid)
returns table(account_id uuid, balance numeric)
language plpgsql
stable
as $$
begin
  return query
  select
    a.id as account_id,
    a.opening_balance + coalesce(sum(
      case
        when t.type = 'income'  and t.account_id = a.id then t.amount
        when t.type = 'expense' and t.account_id = a.id then -t.amount
        when t.type = 'transfer' and t.account_id = a.id then -t.amount
        when t.type = 'transfer' and t.transfer_account_id = a.id then t.amount
        else 0
      end
    ), 0) as balance
  from accounts a
  left join transactions t on t.household_id = a.household_id
    and (t.account_id = a.id or t.transfer_account_id = a.id)
  where a.household_id = target_household_id
  group by a.id, a.opening_balance;
end;
$$;

grant execute on function public.get_account_balances to authenticated, service_role;

grant usage on schema public to authenticated, service_role;
grant usage on type public.household_role to authenticated, service_role;
grant usage on type public.account_type to authenticated, service_role;
grant usage on type public.transaction_type to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage on all sequences in schema public to authenticated, service_role;
