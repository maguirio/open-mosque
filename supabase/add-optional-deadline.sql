alter table public.campaigns
  alter column deadline drop not null;

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
  v_token uuid := coalesce(p_edit_token, gen_random_uuid());
begin
  if char_length(trim(p_full_name)) not between 2 and 120 then
    raise exception 'invalid_name';
  end if;

  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;

  if p_guest_count not between 1 and 20 then
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

revoke all on function public.submit_pledge(text, text, text, integer, boolean, uuid) from public;
grant execute on function public.submit_pledge(text, text, text, integer, boolean, uuid)
  to anon, authenticated;
