-- Only store discord_id when the user's first OAuth provider is Discord.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_name text;
  v_discord_id text;
begin
  v_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    nullif(trim(concat_ws(' ',
      new.raw_user_meta_data->>'given_name',
      new.raw_user_meta_data->>'family_name'
    )), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );

  if coalesce(new.raw_app_meta_data->>'provider', '') = 'discord' then
    v_discord_id := coalesce(
      new.raw_user_meta_data->>'provider_id',
      new.raw_user_meta_data->>'sub'
    );
  end if;

  insert into public.profiles (id, display_name, handle, discord_id, avatar_url)
  values (
    new.id,
    coalesce(nullif(v_name, ''), 'Player'),
    null,
    v_discord_id,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Discord snowflakes for RSVPs with a linked Discord identity (Google-only users omitted).
create or replace function public.discord_ids_for_game(p_game_id uuid)
returns text[]
language sql
security definer
set search_path = public, auth
stable
as $$
  select coalesce(
    array_agg(distinct discord_id order by discord_id),
    '{}'::text[]
  )
  from (
    select coalesce(
      nullif(trim(i.identity_data->>'sub'), ''),
      nullif(trim(i.identity_data->>'provider_id'), '')
    ) as discord_id
    from public.rsvps r
    inner join auth.identities i
      on i.user_id = r.user_id and i.provider = 'discord'
    where r.game_id = p_game_id
  ) ids
  where discord_id ~ '^\d{17,20}$';
$$;

revoke all on function public.discord_ids_for_game(uuid) from public;
grant execute on function public.discord_ids_for_game(uuid) to service_role;
