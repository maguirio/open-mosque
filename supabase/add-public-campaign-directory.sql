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
    count(p.id)::bigint as pledge_count,
    coalesce(sum(p.guest_count), 0)::bigint as guest_total
  from public.campaigns c
  left join public.pledges p on p.campaign_id = c.id
  where c.active = true
  group by c.id
  order by c.name asc;
$$;

revoke all on function public.list_public_campaigns() from public;
grant execute on function public.list_public_campaigns() to anon, authenticated;
