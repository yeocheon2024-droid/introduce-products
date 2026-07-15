-- ============================================================
-- 야채 품목별 마진 컬럼 추가  (2026-07-09)
--
-- 목적: 야채는 매일 경매가가 바뀌므로, 품목마다 마진을 저장해두고
--       아침에 경매가만 올리면 판매가가 자동 계산되게 한다.
--       판매가 = 경매가 + 마진
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → 아래 전체 붙여넣기 → Run
--
-- 안전성: 기존 컬럼/데이터는 하나도 안 건드림. 빈 칸 2개만 추가.
--         여러 번 실행해도 안전 (IF NOT EXISTS).
--
-- ※ 마진 값(기본 10% 등)은 여기서 정하지 않는다.
--    → ERP "야채 마진율 관리" 화면에서 업로드·일괄적용으로 설정.
-- ============================================================


-- 마진 컬럼 2개 추가
--   margin_type  : 'rate'   = 퍼센트(%)   예) 10   → 경매가 +10%
--                  'amount' = 정액(원)    예) 2000 → 경매가 +2,000원
--   margin_value : 위 방식에 따른 숫자값
--   (값이 비어있으면 = 아직 마진 미설정 → 화면에서 일괄적용으로 채움)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS margin_type  text,
  ADD COLUMN IF NOT EXISTS margin_value numeric;


-- 잘못된 값 방지 (rate / amount 만 허용)
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_margin_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_margin_type_check
  CHECK (margin_type IS NULL OR margin_type IN ('rate', 'amount'));


-- 확인 — 칸이 잘 생겼는지 (야채 품목 수 / 마진 설정된 수)
SELECT COUNT(*)                                      AS "야채 품목수",
       COUNT(margin_type)                            AS "마진 설정된 수",
       COUNT(*) - COUNT(margin_type)                 AS "미설정(화면에서 일괄적용 예정)"
FROM products
WHERE major_name = '야채';
