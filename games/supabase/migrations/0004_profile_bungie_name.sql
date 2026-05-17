alter table public.profiles
  add column if not exists bungie_name text;

comment on column public.profiles.bungie_name is
  'Bungie.net name with discriminator, e.g. Example#1234';
