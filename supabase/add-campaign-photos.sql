alter table public.campaigns
  add column if not exists photo_url text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists website_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-photos',
  'campaign-photos',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop function if exists public.get_public_campaign(text);
drop function if exists public.list_public_campaigns();

create or replace function public.get_public_campaign(p_slug text)
returns table (
  id uuid,
  slug text,
  name text,
  goal integer,
  event_date date,
  deadline date,
  food_info text,
  photo_url text,
  address text,
  city text,
  website_url text,
  pledge_count bigint,
  guest_total bigint
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    c.id,
    c.slug,
    c.name,
    c.goal,
    c.event_date,
    c.deadline,
    c.food_info,
    c.photo_url,
    c.address,
    c.city,
    c.website_url,
    count(p.id)::bigint as pledge_count,
    coalesce(sum(p.guest_count), 0)::bigint as guest_total
  from public.campaigns c
  left join public.pledges p on p.campaign_id = c.id
  where c.slug = p_slug
    and c.active = true
  group by c.id;
$$;

create or replace function public.list_public_campaigns()
returns table (
  id uuid,
  slug text,
  name text,
  goal integer,
  event_date date,
  deadline date,
  food_info text,
  photo_url text,
  address text,
  city text,
  website_url text,
  pledge_count bigint,
  guest_total bigint
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    c.id,
    c.slug,
    c.name,
    c.goal,
    c.event_date,
    c.deadline,
    c.food_info,
    c.photo_url,
    c.address,
    c.city,
    c.website_url,
    count(p.id)::bigint as pledge_count,
    coalesce(sum(p.guest_count), 0)::bigint as guest_total
  from public.campaigns c
  left join public.pledges p on p.campaign_id = c.id
  where c.active = true
  group by c.id
  order by c.name asc;
$$;

revoke all on function public.get_public_campaign(text) from public;
revoke all on function public.list_public_campaigns() from public;
grant execute on function public.get_public_campaign(text) to anon, authenticated;
grant execute on function public.list_public_campaigns() to anon, authenticated;

drop policy if exists "Public can read campaign photos" on storage.objects;
create policy "Public can read campaign photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'campaign-photos');

drop policy if exists "Organizers can upload campaign photos" on storage.objects;
create policy "Organizers can upload campaign photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'campaign-photos'
    and exists (
      select 1
      from public.campaigns c
      where c.id::text = (storage.foldername(name))[1]
        and (
          c.admin_user_id = (select auth.uid())
          or (select public.is_super_admin())
        )
    )
  );

drop policy if exists "Organizers can update campaign photos" on storage.objects;
create policy "Organizers can update campaign photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'campaign-photos'
    and exists (
      select 1
      from public.campaigns c
      where c.id::text = (storage.foldername(name))[1]
        and (
          c.admin_user_id = (select auth.uid())
          or (select public.is_super_admin())
        )
    )
  )
  with check (
    bucket_id = 'campaign-photos'
    and exists (
      select 1
      from public.campaigns c
      where c.id::text = (storage.foldername(name))[1]
        and (
          c.admin_user_id = (select auth.uid())
          or (select public.is_super_admin())
        )
    )
  );

drop policy if exists "Organizers can delete campaign photos" on storage.objects;
create policy "Organizers can delete campaign photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'campaign-photos'
    and exists (
      select 1
      from public.campaigns c
      where c.id::text = (storage.foldername(name))[1]
        and (
          c.admin_user_id = (select auth.uid())
          or (select public.is_super_admin())
        )
    )
  );
