-- products.is_frozen — 냉동식품 여부 (2026-07-12)
-- 입력: ERP 이미지 관리 모달의 "❄️ 냉동식품" 체크박스
-- 표시: 거래처앱(order-customer) 품목 상세 바텀시트에 ❄️ 냉동 배지
-- Supabase 대시보드 > SQL Editor 에서 실행
alter table products add column if not exists is_frozen boolean not null default false;
