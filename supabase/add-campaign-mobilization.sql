alter table public.campaigns
  add column if not exists phase text not null default 'draft';

alter table public.campaigns
  drop constraint if exists campaigns_phase_check;

alter table public.campaigns
  add constraint campaigns_phase_check
  check (phase in ('draft', 'active', 'goal_reached', 'confirmed', 'completed'));

update public.campaigns
set phase = case
  when active then 'active'
  else 'draft'
end
where phase is null or phase = 'draft';

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

create index if not exists campaign_messages_campaign_id_idx
  on public.campaign_messages(campaign_id, created_at desc);

alter table public.campaign_messages enable row level security;

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

revoke all on public.campaign_messages from anon;
revoke all on public.campaign_messages from authenticated;
grant select, insert on public.campaign_messages to authenticated;
