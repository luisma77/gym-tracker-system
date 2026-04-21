create table if not exists public.legal_contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new'
);

alter table public.legal_contact_messages enable row level security;

drop policy if exists "anon can insert legal contact messages" on public.legal_contact_messages;
create policy "anon can insert legal contact messages"
on public.legal_contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "users can read own legal contact messages" on public.legal_contact_messages;
create policy "users can read own legal contact messages"
on public.legal_contact_messages
for select
to authenticated
using (auth.uid() = user_id);
