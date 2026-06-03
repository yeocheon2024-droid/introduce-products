-- =============================================================================
-- image_url 일괄 정리 — 옛 네이버 쇼핑 URL 제거 (16건)
-- 작성일: 2026-06-03
-- 배경: ERP에서 R2에 새 이미지를 업로드했지만 products.image_url 컬럼에 옛
--       네이버 쇼핑(shopping-phinf.pstatic.net) URL이 남아있어 거래처앱이
--       옛 외부 이미지를 우선 표시하던 케이스. 16건 일괄 정리.
-- 대상 선정 기준:
--   1) products.image_url 이 http://shopping-phinf... 등 외부 URL
--   2) R2 (r2-image-proxy) 에 {code}.png 파일이 이미 업로드되어 있음
--   → image_url 을 NULL 로 비우면 거래처앱이 자동으로 R2 의 새 이미지 사용.
-- 보류 대상 (9건): R2 에 .png 없는 품목은 비우면 로고 fallback 만 표시되므로
--   이번 SQL 에서는 제외. 사장님이 새 이미지 R2 업로드 후 정리 권장.
--     WIFLO001, WIFLO002, WIHAM009, WIDAS016, WISOS014,
--     401100009, WFDRY006, WFDRY007, WFDRY008
-- 영향: 이미지 표시만 변경. 가격/이름/카테고리 등 모두 무관.
-- 실행: Supabase Dashboard → SQL Editor → 붙여넣기 → RUN
-- =============================================================================

-- 1) 사전 확인 — 16건의 현재 image_url
SELECT code, name, image_url
FROM products
WHERE code IN (
    'WISOP001','WISOP002','WICLE002','WICLE003','401101036',
    'WIHAM006','WIHAM007','WIHAM008','WIFRZ006','401101092',
    'WICLE001','WISOS015','WIVIN001','WISOP003','WISOS016','WIFRZ008'
)
ORDER BY code;

-- 2) 정리 실행
BEGIN;

UPDATE products
SET image_url = NULL
WHERE code IN (
    'WISOP001','WISOP002','WICLE002','WICLE003','401101036',
    'WIHAM006','WIHAM007','WIHAM008','WIFRZ006','401101092',
    'WICLE001','WISOS015','WIVIN001','WISOP003','WISOS016','WIFRZ008'
);
-- 16 rows 영향 예상

-- 3) 결과 검증 — 모든 image_url 컬럼이 NULL 이어야 함
SELECT code, name, image_url
FROM products
WHERE code IN (
    'WISOP001','WISOP002','WICLE002','WICLE003','401101036',
    'WIHAM006','WIHAM007','WIHAM008','WIFRZ006','401101092',
    'WICLE001','WISOS015','WIVIN001','WISOP003','WISOS016','WIFRZ008'
)
ORDER BY code;

-- 4) 정상이면 COMMIT, 이상하면 ROLLBACK
COMMIT;
-- ROLLBACK;

-- 5) 거래처앱 캐시는 거래처가 앱 재진입(또는 탭 visibility 전환) 시 자동 갱신.
--    즉시 확인하려면 시크릿창으로 jiguorder.com 접속.
