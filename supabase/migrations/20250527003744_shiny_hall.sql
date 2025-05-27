-- Create the delete user function
create or replace function public.delete_user()
returns boolean
language plpgsql
security definer 
set search_path = public
as $$
declare
    v_user_id uuid;
    v_has_active_bookings boolean;
begin
    -- Get the ID of the currently authenticated user
    v_user_id := auth.uid();
    
    -- Check if the user exists
    if v_user_id is null then
        raise exception 'User not authenticated';
    end if;

    -- Check for active bookings
    select exists(
        select 1 
        from public.bookings 
        where user_id = v_user_id 
        and status in ('pending', 'confirmed')
    ) into v_has_active_bookings;

    if v_has_active_bookings then
        raise exception 'Cannot delete account with active bookings';
    end if;

    -- Delete user's data in the correct order to respect foreign key constraints
    
    -- First, delete payments associated with user's bookings
    delete from public.payments
    where booking_id in (
        select id from public.bookings where user_id = v_user_id
    );
    
    -- Then delete bookings
    delete from public.bookings where user_id = v_user_id;
    
    -- Delete vehicles
    delete from public.vehicles where owner_id = v_user_id;
    
    -- Finally delete profile
    delete from public.profiles where id = v_user_id;

    return true;
exception 
    when others then
        raise exception 'Failed to delete user data: %', sqlerrm;
end;
$$;

-- Reset permissions
revoke all on function public.delete_user() from public;
revoke all on function public.delete_user() from anon;
revoke all on function public.delete_user() from authenticated;

-- Grant execute permission to authenticated users
grant execute on function public.delete_user() to authenticated;

-- Add a comment to the function
comment on function public.delete_user() is 'Allows users to delete their own account and associated data';