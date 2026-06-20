-- Adds practical anti-spam controls for public pledge submissions.
-- Safe to run on an existing Open Mosque Supabase project.

create extension if not exists pgcrypto with schema extensions;

update public.pledges
set guest_count = 5
where guest_count > 5;

alter table public.pledges
  drop constraint if exists pledges_guest_count_check;

alter table public.pledges
  add constraint pledges_guest_count_check check (guest_count between 1 and 5);

create table if not exists public.pledge_attempts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  request_fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists pledge_attempts_rate_idx
  on public.pledge_attempts(campaign_id, request_fingerprint, created_at desc);

alter table public.pledge_attempts enable row level security;

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

revoke all on public.pledge_attempts from anon;
revoke all on public.pledge_attempts from authenticated;
revoke all on function public.request_fingerprint() from public;
revoke all on function public.submit_pledge(text, text, text, integer, boolean, uuid) from public;

grant execute on function public.submit_pledge(text, text, text, integer, boolean, uuid)
  to anon, authenticated;
