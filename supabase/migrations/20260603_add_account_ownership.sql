-- Account ownership: NULL = shared by the household, non-NULL = privately owned by that member.
-- Removing a member sets the owner to NULL (account becomes shared) rather than deleting data.

alter table public.accounts
add column if not exists owner_member_id uuid references public.household_members(id) on delete set null;

create index if not exists accounts_owner_member_id_idx
  on public.accounts(owner_member_id);
