-- ============================================================
-- Flow de Barrio · esquema de base de datos para Supabase
-- ============================================================
-- Cómo usarlo:
--   1. Entrá a tu proyecto en supabase.com
--   2. Menú lateral → SQL Editor → New query
--   3. Pegá TODO este archivo y apretá "Run"
-- ============================================================
--
-- Toda la app guarda su estado (servicios, empleados, turnos,
-- gastos, etc.) en una sola fila JSON. Es simple y suficiente
-- para una peluquería: alcanza con un registro compartido.
-- ============================================================

create table if not exists public.app_state (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ── Row Level Security ──
-- La app no tiene login de usuarios: usa la "anon key" pública.
-- Por eso se permite leer y escribir esta única fila.
-- (No guardes datos sensibles que no quieras que sean accesibles
--  con la anon key; ver nota en el README.)
alter table public.app_state enable row level security;

drop policy if exists "app_state_select" on public.app_state;
drop policy if exists "app_state_insert" on public.app_state;
drop policy if exists "app_state_update" on public.app_state;

create policy "app_state_select" on public.app_state
  for select using (true);

create policy "app_state_insert" on public.app_state
  for insert with check (true);

create policy "app_state_update" on public.app_state
  for update using (true) with check (true);

-- ── Realtime ──
-- Permite que admin y cobro se actualicen en vivo entre dispositivos.
alter publication supabase_realtime add table public.app_state;
