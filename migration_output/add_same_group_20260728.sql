-- add_same_group_20260728.sql
-- 동일품목 그룹 기능: 두 매입처에 같은 실물 상품이 각각 등록된 경우
-- 같은 그룹 키(same_group)로 묶어서 단가 비교 + 한쪽만 노출 전환.
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run

alter table public.products add column if not exists same_group text;

-- 확인
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'products' and column_name = 'same_group';
