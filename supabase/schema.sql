-- Leafora CMS. Run in the Supabase SQL Editor.
create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.site_admins enable row level security;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
revoke all on public.site_admins from anon, authenticated;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_content' and policyname = 'Site content is public to read') then
    create policy "Site content is public to read"
      on public.site_content for select to anon, authenticated using (true);
  end if;
end $$;

create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.site_admins where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_content' and policyname = 'Only Leafora admins can insert site content') then
    create policy "Only Leafora admins can insert site content"
      on public.site_content for insert to authenticated
      with check ((select public.is_site_admin()));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_content' and policyname = 'Only Leafora admins can update site content') then
    create policy "Only Leafora admins can update site content"
      on public.site_content for update to authenticated
      using ((select public.is_site_admin()))
      with check ((select public.is_site_admin()));
  end if;
end $$;

-- After inviting/creating the admin account in Supabase Auth, replace the email and run:
-- insert into public.site_admins (user_id)
-- select id from auth.users where lower(email) = lower('YOUR_ADMIN_EMAIL')
-- on conflict (user_id) do nothing;
