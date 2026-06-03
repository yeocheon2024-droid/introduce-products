-- =============================================================================
-- WIFRY005 (곰표-부침가루) image_url 컬럼 초기화
-- 작성일: 2026-06-03
-- 배경: ERP에서 이미지를 새로 R2에 업로드했으나(WIFRY005.png 갱신 완료),
--       products.image_url 컬럼에 옛 네이버 쇼핑 URL이 남아있어
--       거래처앱(jiguorder.com)이 외부 URL을 우선 사용 → 옛 이미지 노출.
-- 조치: image_url = NULL (또는 '')로 비우면 거래처앱이 R2의 WIFRY005.png 사용.
-- 영향: 부침가루 이미지 표시만 변경. 가격/이름/카테고리 등 모두 무관.
-- 실행: Supabase Dashboard → SQL Editor → 붙여넣기 → RUN
-- =============================================================================

-- 1) 사전 확인 — 현재 image_url 값
SELECT code, name, image_url
FROM products
WHERE code = 'WIFRY005';

-- 2) 정리 실행
BEGIN;

UPDATE products
SET image_url = NULL
WHERE code = 'WIFRY005';

-- 3) 결과 검증 — image_url 이 NULL 이어야 함
SELECT code, name, image_url
FROM products
WHERE code = 'WIFRY005';

-- 4) 정상이면 COMMIT, 이상하면 ROLLBACK
COMMIT;
-- ROLLBACK;

-- 5) 거래처앱 캐시는 거래처가 앱 재진입(또는 탭 visibility 전환) 시 자동 갱신.
--    즉시 강제하려면 거래처앱에서 [내정보] → 로그아웃 후 재로그인.
--    또는 시크릿창으로 jiguorder.com 접속 후 '곰표' 검색.
