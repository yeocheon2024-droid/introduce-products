-- =============================================================================
-- products 테이블 UPDATE/DELETE/INSERT 를 authenticated 역할로 잠금
-- 작성일: 2026-07-17
-- 배경: anon key 가 GitHub public repo 에 노출되어 있는 상태에서 public_update/
--       public_delete/public_insert 정책이 public 역할(=anon 포함) 에 열려있어
--       외부 침해 가능. 실제 사고 (계란 sell 값 임의 조작) 발생 후 근본 방어.
-- 조치: SELECT 는 anon 유지 (거래처앱 / 카탈로그 사이트 읽기 필요),
--       INSERT/UPDATE/DELETE 는 로그인된 어드민(authenticated) 만 허용.
-- 사전 조건: ERP 가 Supabase Auth 로 이메일/비번 로그인 상태로 배포되어 있어야 함
--            (v3.6 부터). 안 그러면 로그인 안 된 어드민이 저장/삭제 못 함.
-- 실행: Supabase Dashboard → SQL Editor → 붙여넣기 → RUN
-- =============================================================================

-- 1) 사전 확인 — 현재 정책 목록
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY cmd, policyname;

-- 2) 정책 교체
BEGIN;

-- 옛 public 대상 write 정책 제거
DROP POLICY IF EXISTS "public_insert" ON public.products;
DROP POLICY IF EXISTS "public_update" ON public.products;
DROP POLICY IF EXISTS "public_delete" ON public.products;

-- 새 authenticated 대상 write 정책 (모든 행 허용)
CREATE POLICY "authenticated_insert" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update" ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete" ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- SELECT 는 그대로 유지 (products_anon_select / public_read 는 anon 읽기용).
-- 만약 중복 SELECT 정책이 지저분하면 이 트랜잭션 안에서 정리해도 됨.

-- 3) 결과 검증 — cmd 별로 어느 role 이 정책을 갖고 있는지 확인
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY cmd, policyname;

-- 4) 정상이면 COMMIT, 이상하면 ROLLBACK
COMMIT;
-- ROLLBACK;

-- 5) 이후 검증 절차 (반드시 순서대로):
--    a) ERP v3.6 배포 완료 후 사장님이 이메일/비번 로그인 → 저장/삭제 정상 동작 확인
--    b) 시크릿창에서 아무 계정 안 만든 상태로 ERP 열고 저장 시도 →
--       "권한 없음" 또는 alert 로 실패해야 정상
--    c) 거래처앱(jiguorder.com) / 카탈로그(jigufood.com) 접속 → 품목 리스트 정상 노출
--       (SELECT 는 anon 유지되므로 문제없어야 함)
