-- add_item_group_codes_20260728.sql
-- 품목군 코드 사전: 품목코드 가운데 3자리(SOS, OIL 등)의 한글명을 저장·관리.
-- ERP 품목 추가 모달의 코드 추천 칩과 분류체계 탭의 품목군 관리에서 사용.
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run

create table if not exists public.item_group_codes (
  code text primary key,          -- 품목군 3자리 (예: SOS, OIL, CAN)
  name text not null,             -- 한글명 (예: 소스류, 식용유)
  created_at timestamptz default now()
);

alter table public.item_group_codes enable row level security;

-- ERP(로그인)만 읽고 쓴다 — 다른 ERP 테이블과 동일 기준
drop policy if exists igc_all_auth on public.item_group_codes;
create policy igc_all_auth on public.item_group_codes
  for all to authenticated using (true) with check (true);

-- 확인
select * from public.item_group_codes;
