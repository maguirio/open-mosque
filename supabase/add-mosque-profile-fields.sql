alter table public.campaigns
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists website_url text;

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
