-- =============================================================================
-- 대성 고추분 2건 display_name 초기화
-- 작성일: 2026-05-18
-- 배경: ERP에서 품목명(name)을 '대성 고추 → 대성 고추분(중국산/...)' 으로 변경했으나
--       display_name 컬럼이 옛 이름으로 남아있어 거래처앱(jiguorder.com)에 옛 이름 노출.
-- 조치: display_name = NULL 로 비우면 거래처앱이 자동으로 name 을 사용 (getDisplayName 로직).
-- 영향: 거래처앱 표시명만 변경. 가격/카테고리/이미지 등 모두 무관.
-- 실행: Supabase Dashboard → SQL Editor → 붙여넣기 → RUN
-- =============================================================================

-- 1) 사전 확인 — 어떤 값이 들어있는지
SELECT code, name, display_name
FROM products
WHERE code IN ('402001133', '402001134');

-- 2) 정리 실행
BEGIN;

UPDATE products
SET display_name = NULL
WHERE code IN ('402001133', '402001134');

-- 3) 결과 검증 — display_name 컬럼이 NULL 이어야 함
SELECT code, name, display_name
FROM products
WHERE code IN ('402001133', '402001134');

-- 4) 정상이면 COMMIT, 이상하면 ROLLBACK
COMMIT;
-- ROLLBACK;

-- 5) 거래처앱 측 캐시는 거래처가 앱 재진입(또는 탭 visibility 전환) 시 자동 갱신됨.
--    즉시 강제하려면 거래처앱에서 [내정보] → 로그아웃 후 재로그인.
