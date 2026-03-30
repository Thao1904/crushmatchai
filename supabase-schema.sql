create table if not exists public.submissions (
  id uuid primary key,
  "yourName" text not null,
  "crushName" text not null,
  "yourBirthDate" text not null default '',
  "crushBirthDate" text not null default '',
  locale text not null default 'eng',
  "fakeScore" integer not null,
  "fakeSignals" jsonb not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists submissions_created_at_idx
  on public.submissions ("createdAt" desc);
