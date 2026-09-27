create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
drop policy if exists "Admin checks own membership" on public.admins;
create policy "Admin checks own membership" on public.admins for select to authenticated using (user_id = (select auth.uid()));
create or replace function public.is_lukas_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.is_lukas_admin() from public, anon;
grant execute on function public.is_lukas_admin() to authenticated;
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  caption text not null default '' check (char_length(caption) <= 5000),
  media_url text, media_path text, media_type text check (media_type in ('image','video')),
  created_at timestamptz not null default now(),
  constraint content_required check (char_length(trim(caption)) > 0 or media_path is not null),
  constraint media_consistent check ((media_path is null and media_url is null and media_type is null) or (media_path is not null and media_url is not null and media_type is not null))
);
alter table public.posts enable row level security;
drop policy if exists "Everyone reads moments" on public.posts;
drop policy if exists "Admin adds moments" on public.posts;
drop policy if exists "Admin deletes moments" on public.posts;
create policy "Everyone reads moments" on public.posts for select to anon, authenticated using (true);
create policy "Admin adds moments" on public.posts for insert to authenticated with check (public.is_lukas_admin() and (media_path is null or media_path like (select auth.uid())::text || '/%'));
create policy "Admin deletes moments" on public.posts for delete to authenticated using (public.is_lukas_admin());
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('moments','moments',true,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;
drop policy if exists "Admin uploads moments" on storage.objects;
drop policy if exists "Admin removes moments" on storage.objects;
create policy "Admin uploads moments" on storage.objects for insert to authenticated with check (bucket_id = 'moments' and public.is_lukas_admin() and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Admin removes moments" on storage.objects for delete to authenticated using (bucket_id = 'moments' and public.is_lukas_admin());
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;
end $$;
