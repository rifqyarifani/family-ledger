-- Roll back the Debts feature. Drops the debt tables, the debt_direction
-- enum, and (implicitly) the grants added by 20260602_add_debts.sql.
-- Run this in the Supabase SQL Editor for an existing database.

drop table if exists public.debt_payments;
drop table if exists public.debts;
drop type if exists public.debt_direction;
