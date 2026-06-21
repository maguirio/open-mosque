create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pg_cron;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  goal integer not null default 100 check (goal between 1 and 10000),
  event_date date not null,
  deadline date,
  food_info text not null default '',
  photo_url text,
  address text,
  city text,
  website_url text,
  active boolean not null default true,
  phase text not null default 'draft'
    check (phase in ('draft', 'active', 'goal_reached', 'confirmed', 'completed')),
  admin_user_id uuid references auth.users(id) on delete set null,
  admin_email extensions.citext,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns
  add column if not exists admin_email extensions.citext;

alter table public.campaigns
  add column if not exists photo_url text;

alter table public.campaigns
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists website_url text;

alter table public.campaigns
  add column if not exists phase text not null default 'draft';

alter table public.campaigns
  drop constraint if exists campaigns_phase_check;

alter table public.campaigns
  add constraint campaigns_phase_check
  check (phase in ('draft', 'active', 'goal_reached', 'confirmed', 'completed'));

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

create table if not exists public.pledges (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email extensions.citext not null check (char_length(email::text) between 5 and 254),
  guest_count integer not null check (guest_count between 1 and 5),
  wants_updates boolean not null default true,
  edit_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, email)
);

create table if not exists public.pledge_attempts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  request_fingerprint text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.super_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.pending_campaign_admins (
  campaign_id uuid primary key references public.campaigns(id) on delete cascade,
  email extensions.citext not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  sent_by uuid references auth.users(id) on delete set null,
  subject text not null check (char_length(subject) between 3 and 180),
  body text not null check (char_length(body) between 10 and 6000),
  language text not null default 'bilingual'
    check (language in ('fr', 'en', 'bilingual')),
  recipient_count integer not null default 0 check (recipient_count >= 0),
  provider text not null default 'resend',
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists pledges_campaign_id_idx
  on public.pledges(campaign_id);

create index if not exists pledge_attempts_rate_idx
  on public.pledge_attempts(campaign_id, request_fingerprint, created_at desc);

create index if not exists campaign_messages_campaign_id_idx
  on public.campaign_messages(campaign_id, created_at desc);

alter table public.campaigns enable row level security;
alter table public.pledges enable row level security;
alter table public.pledge_attempts enable row level security;
alter table public.super_admins enable row level security;
alter table public.pending_campaign_admins enable row level security;
alter table public.campaign_messages enable row level security;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.super_admins
    where user_id = (select auth.uid())
  );
$$;

drop policy if exists "Users can read their super admin status" on public.super_admins;
create policy "Users can read their super admin status"
  on public.super_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Super admins can read pending campaign admins"
  on public.pending_campaign_admins;
create policy "Super admins can read pending campaign admins"
  on public.pending_campaign_admins
  for select
  to authenticated
  using ((select public.is_super_admin()));

drop policy if exists "Organizers can read their campaigns" on public.campaigns;
create policy "Organizers can read their campaigns"
  on public.campaigns
  for select
  to authenticated
  using (
    (select auth.uid()) = admin_user_id
    or (select public.is_super_admin())
  );

drop policy if exists "Organizers can update their campaigns" on public.campaigns;
create policy "Organizers can update their campaigns"
  on public.campaigns
  for update
  to authenticated
  using (
    (select auth.uid()) = admin_user_id
    or (select public.is_super_admin())
  )
  with check (
    (select auth.uid()) = admin_user_id
    or (select public.is_super_admin())
  );

drop policy if exists "Super admins can create campaigns" on public.campaigns;
create policy "Super admins can create campaigns"
  on public.campaigns
  for insert
  to authenticated
  with check ((select public.is_super_admin()));

drop policy if exists "Super admins can delete campaigns" on public.campaigns;
create policy "Super admins can delete campaigns"
  on public.campaigns
  for delete
  to authenticated
  using ((select public.is_super_admin()));

drop policy if exists "Organizers can read campaign pledges" on public.pledges;
create policy "Organizers can read campaign pledges"
  on public.pledges
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.campaigns
      where campaigns.id = pledges.campaign_id
        and (
          campaigns.admin_user_id = (select auth.uid())
          or (select public.is_super_admin())
        )
    )
  );

drop policy if exists "Organizers can read campaign messages"
  on public.campaign_messages;
create policy "Organizers can read campaign messages"
  on public.campaign_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.campaigns
      where campaigns.id = campaign_messages.campaign_id
        and (
          campaigns.admin_user_id = (select auth.uid())
          or (select public.is_super_admin())
        )
    )
  );

drop policy if exists "Organizers can create campaign messages"
  on public.campaign_messages;
create policy "Organizers can create campaign messages"
  on public.campaign_messages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.campaigns
      where campaigns.id = campaign_messages.campaign_id
        and (
          campaigns.admin_user_id = (select auth.uid())
          or (select public.is_super_admin())
        )
    )
  );

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

create or replace function public.request_fingerprint()
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_raw_headers text := current_setting('request.headers', true);
  v_headers jsonb;
  v_ip text;
  v_user_agent text;
begin
  if v_raw_headers is null or v_raw_headers = '' then
    return null;
  end if;

  v_headers := v_raw_headers::jsonb;
  v_ip := nullif(
    split_part(
      coalesce(
        v_headers->>'cf-connecting-ip',
        v_headers->>'x-forwarded-for',
        v_headers->>'x-real-ip',
        ''
      ),
      ',',
      1
    ),
    ''
  );
  v_user_agent := nullif(v_headers->>'user-agent', '');

  if v_ip is null and v_user_agent is null then
    return null;
  end if;

  return encode(
    extensions.digest(
      coalesce(v_ip, 'unknown') || '|' || coalesce(v_user_agent, 'unknown'),
      'sha256'
    ),
    'hex'
  );
exception
  when others then
    return null;
end;
$$;

create or replace function public.submit_pledge(
  p_campaign_slug text,
  p_full_name text,
  p_email text,
  p_guest_count integer,
  p_wants_updates boolean,
  p_edit_token uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_campaign_id uuid;
  v_existing public.pledges;
  v_fingerprint text := public.request_fingerprint();
  v_recent_attempts integer := 0;
  v_token uuid := coalesce(p_edit_token, gen_random_uuid());
begin
  if char_length(trim(p_full_name)) not between 2 and 120 then
    raise exception 'invalid_name';
  end if;

  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;

  if p_guest_count not between 1 and 5 then
    raise exception 'invalid_guest_count';
  end if;

  select c.id
  into v_campaign_id
  from public.campaigns c
  where c.slug = p_campaign_slug
    and c.active = true
    and (c.deadline is null or c.deadline >= current_date);

  if v_campaign_id is null then
    raise exception 'campaign_unavailable';
  end if;

  delete from public.pledge_attempts
  where created_at < now() - interval '48 hours';

  if p_edit_token is null and v_fingerprint is not null then
    select count(*)::integer
    into v_recent_attempts
    from public.pledge_attempts a
    where a.campaign_id = v_campaign_id
      and a.request_fingerprint = v_fingerprint
      and a.created_at > now() - interval '10 minutes';

    if v_recent_attempts >= 5 then
      raise exception 'too_many_attempts';
    end if;

    insert into public.pledge_attempts (campaign_id, request_fingerprint)
    values (v_campaign_id, v_fingerprint);
  end if;

  select *
  into v_existing
  from public.pledges p
  where p.campaign_id = v_campaign_id
    and p.email = lower(trim(p_email))::extensions.citext;

  if found then
    if p_edit_token is null
      or v_existing.edit_token_hash <> encode(
        extensions.digest(p_edit_token::text, 'sha256'),
        'hex'
      )
    then
      raise exception 'pledge_already_exists';
    end if;

    update public.pledges
    set
      full_name = trim(p_full_name),
      guest_count = p_guest_count,
      wants_updates = p_wants_updates,
      updated_at = now()
    where id = v_existing.id;
  else
    insert into public.pledges (
      campaign_id,
      full_name,
      email,
      guest_count,
      wants_updates,
      edit_token_hash
    )
    values (
      v_campaign_id,
      trim(p_full_name),
      lower(trim(p_email))::extensions.citext,
      p_guest_count,
      p_wants_updates,
      encode(extensions.digest(v_token::text, 'sha256'), 'hex')
    );
  end if;

  return v_token;
end;
$$;

create or replace function public.purge_expired_pledges()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted bigint;
begin
  delete from public.pledges p
  using public.campaigns c
  where p.campaign_id = c.id
    and c.event_date < current_date - 30;

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

create or replace function public.assign_campaign_admin(
  p_campaign_id uuid,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email extensions.citext := lower(trim(p_email))::extensions.citext;
  v_user_id uuid;
begin
  if not public.is_super_admin() then
    raise exception 'not_authorized';
  end if;

  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;

  select id
  into v_user_id
  from auth.users
  where lower(email) = v_email::text
  limit 1;

  update public.campaigns
  set
    admin_user_id = v_user_id,
    admin_email = v_email,
    updated_at = now()
  where id = p_campaign_id;

  if not found then
    raise exception 'campaign_not_found';
  end if;

  if v_user_id is null then
    insert into public.pending_campaign_admins (campaign_id, email, invited_by)
    values (p_campaign_id, v_email, (select auth.uid()))
    on conflict (campaign_id) do update
    set email = excluded.email,
        invited_by = excluded.invited_by,
        created_at = now();
    return 'invitation_required';
  end if;

  delete from public.pending_campaign_admins where campaign_id = p_campaign_id;
  return 'assigned';
end;
$$;

create or replace function public.remove_campaign_admin(p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_super_admin() then
    raise exception 'not_authorized';
  end if;

  update public.campaigns
  set admin_user_id = null,
      admin_email = null,
      updated_at = now()
  where id = p_campaign_id;

  delete from public.pending_campaign_admins where campaign_id = p_campaign_id;
end;
$$;

create or replace function public.complete_pending_campaign_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.campaigns c
  set admin_user_id = new.id,
      updated_at = now()
  from public.pending_campaign_admins p
  where p.campaign_id = c.id
    and p.email = lower(new.email)::extensions.citext;

  delete from public.pending_campaign_admins
  where email = lower(new.email)::extensions.citext;

  return new;
end;
$$;

drop trigger if exists complete_pending_campaign_admin on auth.users;
create trigger complete_pending_campaign_admin
  after insert or update of email on auth.users
  for each row
  execute function public.complete_pending_campaign_admin();

revoke all on public.campaigns from anon;
revoke all on public.pledges from anon;
revoke all on public.pledge_attempts from anon;
revoke all on public.campaigns from authenticated;
revoke all on public.pledges from authenticated;
revoke all on public.pledge_attempts from authenticated;
revoke all on public.super_admins from anon;
revoke all on public.super_admins from authenticated;
revoke all on public.pending_campaign_admins from anon;
revoke all on public.pending_campaign_admins from authenticated;
revoke all on public.campaign_messages from anon;
revoke all on public.campaign_messages from authenticated;

grant select, insert, update, delete on public.campaigns to authenticated;
grant select on public.pledges to authenticated;
grant select on public.super_admins to authenticated;
grant select on public.pending_campaign_admins to authenticated;
grant select, insert on public.campaign_messages to authenticated;

revoke all on function public.get_public_campaign(text) from public;
revoke all on function public.list_public_campaigns() from public;
revoke all on function public.request_fingerprint() from public;
revoke all on function public.submit_pledge(text, text, text, integer, boolean, uuid) from public;
revoke all on function public.purge_expired_pledges() from public;
revoke all on function public.is_super_admin() from public;
revoke all on function public.assign_campaign_admin(uuid, text) from public;
revoke all on function public.remove_campaign_admin(uuid) from public;
grant execute on function public.get_public_campaign(text) to anon, authenticated;
grant execute on function public.list_public_campaigns() to anon, authenticated;
grant execute on function public.submit_pledge(text, text, text, integer, boolean, uuid)
  to anon, authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.assign_campaign_admin(uuid, text) to authenticated;
grant execute on function public.remove_campaign_admin(uuid) to authenticated;

do $$
declare
  v_job_id bigint;
begin
  select jobid
  into v_job_id
  from cron.job
  where jobname = 'open-mosque-purge-expired-pledges';

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'open-mosque-purge-expired-pledges',
    '15 3 * * *',
    'select public.purge_expired_pledges();'
  );
end;
$$;

insert into public.campaigns (
  slug,
  name,
  goal,
  event_date,
  deadline,
  food_info
)
values (
  'laval',
  'Centre communautaire de Laval',
  100,
  '2026-09-20',
  '2026-08-31',
  'Un repas convivial sera offert. Les détails suivront.'
)
on conflict (slug) do nothing;

-- Responsable local :
-- update public.campaigns
-- set admin_user_id = 'UUID_DU_RESPONSABLE'
-- where slug = 'laval';

-- Super administrateur global :
-- insert into public.super_admins (user_id)
-- values ('UUID_DU_SUPER_ADMIN')
-- on conflict (user_id) do nothing;
