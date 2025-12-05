# Supabase schema (VISIA)

## Tables

### public.history (уже есть)
- id uuid PK
- user_id uuid FK → auth.users.id
- image_url text
- prompt text
- model_id text
- created_at timestamptz

### public.users (создано)
```sql
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  token_balance integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'users_select_own') then
    create policy "users_select_own" on public.users
      for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_update_own') then
    create policy "users_update_own" on public.users
      for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_insert_self') then
    create policy "users_insert_self" on public.users
      for insert with check (auth.uid() = id);
  end if;
end
$$;
```

## Public schema inventory (Supabase)
- history: id (uuid PK), user_id (uuid FK → auth.users.id), image_url (text), prompt (text), model_id (text), created_at (timestamptz). RLS: 2 policies (select/insert own) — включить, если нужен приватный доступ.
- users: id (uuid PK → auth.users.id), email (text, unique), token_balance (int, default 0), created_at (timestamptz). RLS: 3 policies (select/update/insert own) включены.

## Pricing stub (frontend)
- В `AI_MODELS` добавлены `basePriceUsd` для Nano Banana, Nano Banana Pro, Seedream 4.5, ImagineArt 1.5. На UI показывается оценка с 20% маркапом. Реального списания токенов/биллинга нет (заглушка).

## Политики (рекомендуется включить RLS)
Для `public.users`:
```sql
-- включить RLS
alter table public.users enable row level security;

-- читать/обновлять только свои записи
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- вставка своей записи (если нужно ручное создание профиля)
create policy "users_insert_self" on public.users
  for insert with check (auth.uid() = id);
```

Для `public.history` (если RLS включён):
```sql
-- примерные политики
alter table public.history enable row level security;

create policy "history_select_own" on public.history
  for select using (auth.uid() = user_id);

create policy "history_insert_own" on public.history
  for insert with check (auth.uid() = user_id);
```

## Где выполнить
- Supabase Dashboard → проект visia → SQL Editor: выполнить блоки создания таблицы и политик.
- Либо через Table Editor создать/проверить таблицу `users`, включить RLS и добавить политики в SQL Editor.
