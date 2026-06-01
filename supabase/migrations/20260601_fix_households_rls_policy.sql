-- Fix: households RLS policy uses wrong column (created_by instead of id)
--
-- The function is_household_member() expects a household_id UUID, not a user_id.
-- The bug was that the policy referenced "created_by" (a user UUID) instead of "id"
-- (a household UUID). This caused the function to search household_members for a
-- row with household_id = <user_uuid>, which never matches, so the function always
-- returned false and all households were blocked from SELECT.
--
-- The household_members table works correctly because its policy uses
-- household_id (the correct column). The accounts table also works because it
-- uses household_id. Only households had the wrong column reference.

DROP POLICY IF EXISTS "Members can view their households" ON public.households;

CREATE POLICY "Members can view their households"
ON public.households
FOR SELECT
TO authenticated
USING (public.is_household_member(id));
