-- Add icon column to categories table
-- Run this in Supabase SQL Editor if you have an existing database

alter table public.categories add column if not exists icon text;
