-- Revoke all existing permissions
revoke all on all functions in schema public from public;
revoke all on all functions in schema public from anon;
revoke all on all functions in schema public from authenticated;

-- Drop existing function
drop function if exists public.delete_user();

-- Create the delete user function with explicit schema
create or replace function public.delete_user()
returns boolean
language plpgsql
security definer 
set search_path = public
as $$
declare
    v_user_id uuid;
begin
    -- Get the ID of the currently authenticated user
    v_user_id := auth.uid();
    
    -- Check if the user exists
    if v_user_id is null then
        return false;
    end if;

    -- Delete user's bookings if table exists
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'bookings') then
        delete from public.bookings where user_id = v_user_id;
    end if;
    
    -- Delete user's vehicles if table exists
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'vehicles') then
        delete from public.vehicles where owner_id = v_user_id;
    end if;
    
    -- Delete user's profile if table exists
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
        delete from public.profiles where id = v_user_id;
    end if;
    
    -- Delete the user's auth account
    delete from auth.users where id = v_user_id;

    return true;
exception 
    when others then
        return false;
end;
$$;

-- Reset permissions
alter function public.delete_user() owner to postgres;
revoke all on function public.delete_user() from public;
revoke all on function public.delete_user() from anon;
revoke all on function public.delete_user() from authenticated;

-- Grant execute permission to authenticated users
grant execute on function public.delete_user() to authenticated;

-- Add a comment to the function
comment on function public.delete_user() is 'Allows users to delete their own account and associated data';

-- Notify the database of the changes
notify pgrst, 'reload schema';

-- Enable RLS on the users table if not already enabled
alter table if exists auth.users enable row level security;

-- Drop existing policies
drop policy if exists "Users can delete their own account" on auth.users;

-- Create new RLS policy for the users table
create policy "Users can delete their own account"
    on auth.users
    for delete
    using (auth.uid() = id); 