-- Improve display_name extraction for Apple (given_name / family_name) and other providers
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_name text;
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

  insert into public.profiles (id, display_name, handle, discord_id, avatar_url)
  values (
    new.id,
    coalesce(nullif(v_name, ''), 'Player'),
    null,
    new.raw_user_meta_data->>'provider_id',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
