-- =============================================================================
-- 현금할인가(transfer_price) 필드 추가 (v2.44)
-- 작성일: 2026-04-26
-- 배경: 카드결제 도입 대비 이체할인 표시 시스템 구축.
--       sell = 정가(카드가), transfer_price = 현금할인가 (NULL 허용 = 미설정).
--
-- 법적 주의: 카드 결제 도입과 동시에 sell 일괄 인상은 여전법 19조 위반 소지.
--           시스템은 인프라만 구축하고, 가격 입력은 수동·점진적으로 진행.
-- =============================================================================

-- 1) 컬럼 추가 (NULL 허용 — 미설정 품목은 sell 그대로 적용)
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS transfer_price INTEGER;

COMMENT ON COLUMN products.transfer_price IS
    '현금할인가 (계좌이체 결제 시 적용). NULL이면 sell(정가) 그대로 적용.';

-- 2) 검증 — 컬럼 추가 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name = 'transfer_price';
