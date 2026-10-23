-- Divine Nine Events: additive migration (safe to re-run; never drops or rewrites existing data)

alter table public.events
  add column if not exists organizations text[] not null default '{}',
  add column if not exists school text not null default '',
  add column if not exists is_hbcu boolean not null default false,
  add column if not exists chapter text not null default '',
  add column if not exists media_type text not null default 'image',
  add column if not exists media_url text,
  add column if not exists poster_url text,
  add column if not exists media_aspect text not null default 'original',
  add column if not exists media_fit text not null default 'cover',
  add column if not exists media_zoom real not null default 1,
  add column if not exists media_x real not null default 50,
  add column if not exists media_y real not null default 50,
  add column if not exists media_size text not null default 'full',
  add column if not exists is_hidden boolean not null default false;

create index if not exists events_organizations_idx on public.events using gin (organizations);
create index if not exists events_school_idx on public.events (lower(school));

-- Admin-editable logo overrides for the nine organizations
create table if not exists public.org_overrides (
  slug text primary key,
  logo_url text,
  updated_at timestamptz not null default now()
);
alter table public.org_overrides enable row level security;
