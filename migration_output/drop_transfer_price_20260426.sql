-- =============================================================================
-- transfer_price 컬럼 폐기 (v2.45)
-- 작성일: 2026-04-26
-- 배경: 정책 단순화 — sell 자체를 현금할인가로 사용, 정상가는 동적 계산.
--       정상가 = round(sell × 1.03 / 10) * 10  (10원 단위 반올림)
--       이 계산은 모든 사이트의 calcCardPrice() 함수에서 처리.
--       DB에 정상가 별도 저장할 필요 없음.
--
-- 실행 시점: 모든 사이트가 v2.45 이상으로 배포된 후 (transfer_price 참조 제거됨)
-- =============================================================================

-- (a) 현황 확인 — transfer_price 데이터 있는 품목 수 (참고용)
SELECT
    COUNT(*) FILTER (WHERE transfer_price IS NOT NULL) AS with_transfer_price,
    COUNT(*) AS total_products
FROM products;

-- (b) 컬럼 영구 삭제
ALTER TABLE products DROP COLUMN IF EXISTS transfer_price;
