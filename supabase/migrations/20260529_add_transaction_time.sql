-- Add transaction_time column to transactions table
-- Run this in Supabase SQL Editor if you have an existing database

alter table public.transactions add column if not exists transaction_time time;
