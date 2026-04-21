alter table public.profiles
  add column if not exists username text;

create unique index if not exists idx_profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.resolve_login_identifier(login_identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_identifier text := lower(trim(login_identifier));
  resolved_email text;
begin
  if normalized_identifier is null or normalized_identifier = '' then
    return null;
  end if;

  if position('@' in normalized_identifier) > 0 then
    return normalized_identifier;
  end if;

  select email
  into resolved_email
  from public.profiles
  where lower(username) = normalized_identifier
  limit 1;

  return resolved_email;
end;
$$;

grant execute on function public.resolve_login_identifier(text) to anon, authenticated;

update public.profiles
set username = lower(nullif(email, ''))
where username is null and email is not null;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'No authenticated user found';
  end if;

  delete from auth.users
  where id = current_user_id;
end;
$$;

grant execute on function public.delete_my_account() to authenticated;
