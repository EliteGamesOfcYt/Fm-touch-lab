-- ============================================================
-- 🛡️ FM TOUCH LAB — SETUP DO BANCO (Supabase)
-- Rode este arquivo UMA VEZ no SQL Editor do seu projeto.
-- É seguro rodar de novo (ele só cria o que falta).
-- ============================================================

create extension if not exists pgcrypto;

-- ============ 1) PERFIS ============
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  nome        text not null,
  club_id     text,
  club_nome   text,
  club_cor1   text,
  club_cor2   text,
  club_escudo text,
  pais        text,
  publico     boolean not null default true,
  criado      timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_read   on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;

-- leitura: perfil público OU o próprio dono
create policy profiles_read on public.profiles
  for select using (publico = true or auth.uid() = id);
-- criar: só o próprio usuário logado
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);
-- editar: só o próprio usuário logado
create policy profiles_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ============ 2) TÁTICAS PUBLICADAS ============
create table if not exists public.tactics (
  id        bigint generated always as identity primary key,
  owner     uuid not null references public.profiles(id) on delete cascade,
  nome      text not null,
  formacao  text not null default '4-2-3-1',
  descricao text not null default '',
  criado    timestamptz not null default now()
);

alter table public.tactics enable row level security;

drop policy if exists tactics_read   on public.tactics;
drop policy if exists tactics_insert on public.tactics;
drop policy if exists tactics_update on public.tactics;
drop policy if exists tactics_delete on public.tactics;

-- leitura: dono ou tática de perfil público
create policy tactics_read on public.tactics
  for select using (
    auth.uid() = owner
    or exists (select 1 from public.profiles p where p.id = owner and p.publico = true)
  );
create policy tactics_insert on public.tactics
  for insert with check (auth.uid() = owner);
create policy tactics_update on public.tactics
  for update using (auth.uid() = owner) with check (auth.uid() = owner);
create policy tactics_delete on public.tactics
  for delete using (auth.uid() = owner);

-- ============ 3) VOTOS (⭐) NAS TÁTICAS ============
create table if not exists public.tactic_votes (
  tactic bigint not null references public.tactics(id) on delete cascade,
  voter  uuid   not null references auth.users(id) on delete cascade,
  stars  int    not null check (stars between 1 and 5),
  criado timestamptz not null default now(),
  primary key (tactic, voter)
);

alter table public.tactic_votes enable row level security;

drop policy if exists votes_read   on public.tactic_votes;
drop policy if exists votes_insert on public.tactic_votes;
drop policy if exists votes_update on public.tactic_votes;
drop policy if exists votes_delete on public.tactic_votes;

create policy votes_read on public.tactic_votes
  for select using (true);
create policy votes_insert on public.tactic_votes
  for insert with check (auth.uid() = voter);
create policy votes_update on public.tactic_votes
  for update using (auth.uid() = voter) with check (auth.uid() = voter);
create policy votes_delete on public.tactic_votes
  for delete using (auth.uid() = voter);

-- ============ 4) PUBLICAÇÕES (pronto pro futuro) ============
create table if not exists public.posts (
  id      bigint generated always as identity primary key,
  owner   uuid not null references public.profiles(id) on delete cascade,
  titulo  text not null,
  corpo   text not null default '',
  criado  timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists posts_read   on public.posts;
drop policy if exists posts_insert on public.posts;
drop policy if exists posts_update on public.posts;
drop policy if exists posts_delete on public.posts;

create policy posts_read on public.posts
  for select using (
    auth.uid() = owner
    or exists (select 1 from public.profiles p where p.id = owner and p.publico = true)
  );
create policy posts_insert on public.posts
  for insert with check (auth.uid() = owner);
create policy posts_update on public.posts
  for update using (auth.uid() = owner) with check (auth.uid() = owner);
create policy posts_delete on public.posts
  for delete using (auth.uid() = owner);

-- ============================================================
-- ✅ Pronto! Nenhum usuário consegue mexer nos dados dos outros.
--    O "admim" do site és TU, direto pelo painel do Supabase
--    (Table Editor / Authentication) — fora do código do site.
-- ============================================================
