# ERP 품목 관리 시스템 - 현재 상황 (2026-03-25)

## 2026-11-07 이미지관리 매입처 필터 (v3.60)

- 이미지관리 상단에 매입처 선택 추가. 실제 품목에 사용되는 매입처를 이름순으로 표시하며 같은 이름도 코드로 구분한다.
- 검색·분류·이미지/표시사항 등록 여부와 함께 적용. 필터 변경 시 첫 페이지로 이동하며 이미지 갱신 시 매입처 선택 유지. 결과 요약도 필터 결과 기준으로 집계.
- 전체 인라인 JavaScript 구문 확인 및 모의 데이터로 매입처 코드 구분·동명 매입처·필터 조합·선택 유지·삭제된 매입처 초기화·페이지 초기화 확인 통과.
- 이전 이미지 구분·확대 기능을 포함한 최신 main에 이번 변경만 반영. 기존 작업 폴더의 다른 미커밋 수정은 보존.

## 2026-11-07 이미지 구분·확대 (v3.59)

- 사용자 승인으로 대표이미지 / 상품 상세정보 / 품질표시사항 업로드를 구분하고 이미지 클릭 시 확대·축소·긴 이미지 스크롤 지원.
- 기존 label 파일 5장은 보존하고 분류만 품목코드_image-types.json에 저장. 새 업로드는 선택한 구분으로 저장하고 기존 이미지는 분류 선택으로 이동 가능. 상세/품질 합계 최대 5장.
- 코드 변경 시 이미지 분류 파일도 이전. 고객 사이트 order-customer의 별도 분류 섹션과 동일한 메타데이터 규칙을 공유.
- 검증: 전체 인라인 JavaScript 구문, 모의 브라우저 업로드/분류 변경·저장/확대·ESC, 고객의 명시 분류·확대, 확대·초기화·드래그·핀치 통과. 고객 Next/OpenNext 전체 빌드 및 Worker dry-run 통과.
- 최신 origin/main 기반 별도 outputs/erp-image-sections-repo에서 이번 이미지 기능만 배포. 원래 작업 폴더의 다른 미커밋 수정은 보존.

## 사이트 구조 (3개 사이트, 1개 DB)

```
┌─────────────────┐
│  ERP 사이트       │ GitHub Pages (읽기/쓰기)
│  introduce-products │
└────────┬────────┘
         │ 동기화 (클라우드에 업로드)
         ▼
┌─────────────────┐
│   Supabase DB    │ 공유 데이터베이스
└──┬──────────┬───┘
   │          │
   ▼          ▼
카탈로그      전단지 생성기
사이트        사이트
Cloudflare   Cloudflare
(읽기전용)   (읽기전용)
```

| 사이트 | 용도 | 배포 | URL |
|--------|------|------|-----|
| ERP | 품목 관리 (내부용) | GitHub Pages | https://yeocheon2024-droid.github.io/introduce-products/ |
| 카탈로그 | 품목 안내 (고객용) | Cloudflare Pages | https://product-catalog-4qg.pages.dev/ |
| 전단지 | 전단지 생성 (내부용) | Cloudflare Pages | https://product-flyer.pages.dev/ |

### GitHub 저장소
- ERP: https://github.com/yeocheon2024-droid/introduce-products
- 카탈로그: https://github.com/yeocheon2024-droid/product-catalog
- 전단지: https://github.com/yeocheon2024-droid/product-flyer

---

## ERP 사이트 기능

| 탭 | 기능 | 상태 |
|----|------|------|
| 대시보드 | 통계, 최근 등록 품목 | ✅ |
| 품목 관리 | CRUD, 검색/필터, 페이지네이션, PC/모바일 반응형 | ✅ |
| 매입처 | 등록/관리 | ✅ |
| 분류 체계 | 대분류/중분류 관리 | ✅ |
| 마진율 설정 | 카테고리별 마진율, 판매단가 미설정 품목, 일괄 적용 | ✅ |
| 이미지 관리 | 일괄 업로드, ZIP 다운로드, 삭제, 네이버 이미지 저장 | ✅ |
| 엑셀 업로드 | .xlsx/.xls/.csv 파싱, 미리보기 후 일괄 등록 | ✅ |
| 견적서 분석 | Claude AI 분석, 기존 품목 비교/매칭 | ✅ |
| 발주서 | 품목 선택, 수량 편집, 인쇄/엑셀 다운로드 | ✅ |
| 가격 비교 | 네이버/쿠팡 최저가 비교, AI 키워드 최적화, 엑셀 다운로드 | ✅ |
| ERP 내보내기 | 발주고(39컬럼), 경영박사(7컬럼) | ✅ |
| Supabase 설정 | 양방향 동기화 (로컬에 없는 품목 Supabase에서 자동 삭제) | ✅ |

---

## 카탈로그 사이트 (2026-03-24 신규)

### 기술 스택
- Next.js 14 (Static Export) + Tailwind CSS + Supabase
- Cloudflare Pages 배포
- 환경변수: next.config.js에 fallback 설정

### 기능
- 빙그레 스타일 디자인 (깔끔한 흰색 배경, 골드/앰버 액센트)
- 법인 로고 (투명배경) + Jua(주아) 폰트 회사명
- 카테고리 필터 탭 (쌀 > 김치/반찬 > 계란 > 기름/분말 > 품목수순)
- 품목 그리드 (모바일 2열 / PC 4열)
- 무한스크롤 (30개씩 로드)
- 가격 숨김 기본 (?price=on 으로 표시)
- 품목 클릭 → 모달 상세 (좌 이미지 + 우 정보)
- 이미지 없는 품목 → 로고 워터마크 표시
- 회사소개 섹션 + 연락처
- /m/?code=XXX 상세 페이지 (외부 링크/QR용)

### 회사 정보
- 회사명: 지구농산 농업회사법인
- 대표전화: 1566-1521
- 팩스: 032-330-4428
- 이메일: ljsgn5958@gmail.com
- 주소: 79-25, Ilsin-dong, Bupyeong-gu, Incheon
- 슬로건: 쌀 · 김치 · 계란 · 종합유통

---

## 전단지 생성기 사이트 (2026-03-24 신규)

### 기능
- Supabase에서 품목 로드 (판매단가 있는 품목만)
- 품목 체크박스 선택 + 카테고리 필터 + 검색
- A4 세로 (3x4=12개) / A5 가로 (3x2=6개) 레이아웃
- 회사명/날짜/연락처 입력
- 미리보기 + PDF 다운로드 (html2canvas + jsPDF)

---

## 2026-03-24 변경 이력

### ERP 사이트
- 가격비교 속도 최적화 (3건 병렬 + 0.2초 딜레이, 기존 대비 7배 빠름)
- 가격비교 AI 키워드 최적화 (Claude API로 검색어 변환)
- Supabase 업로드 시 로컬에 없는 품목 자동 삭제

### 카탈로그 사이트 (신규 구축)
- Next.js + Tailwind + Supabase + Cloudflare Pages
- 빙그레 스타일 디자인 적용
- 법인 로고 + Jua 폰트 + 골드/앰버 색상
- 카테고리 순서: 쌀 > 김치/반찬 > 계란 > 기름/분말 > 품목수순
- 가격 숨김/표시 토글 (?price=on)
- QR 코드 생성 (투명배경 PNG)

### 전단지 생성기 사이트 (신규 구축)
- Next.js + Tailwind + Supabase + Cloudflare Pages
- 품목 선택 → A4/A5 전단지 → PDF 다운로드

---

## 2026-03-25 변경 이력

### ERP 사이트 (v2.7)
- 가격비교 출고가 파싱 수정 (부동소수점 → Math.round)
- 가격비교 검색 정확도 개선: sort=sim(유사도순) + 언더스코어/특수문자 제거
- 가격비교 품목명+규격 유사도 매칭 (pcBestMatch 함수 추가)
- 이미지 라이트박스 버그 수정
- 버전 표시 추가 (사이드바에 v2.x 표시)

### Cloudflare Worker (naver-proxy)
- 식자재왕 (ewangmart.com) 크롤링 프록시 추가 (/ewang 엔드포인트)
- 세션 쿠키 획득 → AJAX 검색 → HTML 파싱 → JSON 반환
- 네이버 API + 식자재왕 동시 비교 준비 완료

### 카탈로그 사이트
- 회사 로고 폰트 크기/굵기 증가 (text-2xl, font-extrabold, h-11)

### 전단지 생성기 사이트 (v3.5)
- PNG/PDF 출력 품질 개선 (scale 3배)
- PNG 캡처 비율 문제 수정 (onclone으로 클론 문서에서 zoom 제거 + 794x1123 고정)
- 아직 미리보기와 PNG 비율 차이 이슈 진행 중

### 식자재 B2B 사이트 크롤링 조사
- 식봄: 403 차단 → 불가
- 식자재왕: 크롤링 가능 (AJAX API 발견, robots.txt 허용)
- 푸드엔, 마창식품, 다담몰: 추가 크롤링 가능 사이트 발견

### 미완료 / 다음 작업
- 전단지 PNG 캡처 비율 이슈 최종 확인 (v3.5)
- 식자재왕 Worker 코드 Cloudflare에 배포 필요
- ERP 가격비교에 식자재왕 컬럼 추가
- 추가 식자재 사이트 (푸드엔, 마창식품) 크롤링 연동 검토

---

## 주요 기술 스택

### ERP 사이트
- Vanilla HTML/CSS/JS (단일 파일 ~4300줄)
- Supabase (DB + Storage) + localStorage
- Claude API (견적서 분석), 네이버 API (가격비교/이미지)
- SheetJS (엑셀), JSZip (ZIP)

### 카탈로그/전단지 사이트
- Next.js 14 (Static Export) + Tailwind CSS
- Supabase JS Client v2 (읽기전용)
- Cloudflare Pages 배포
- wrangler.toml: nodejs_compat 플래그

---

## Supabase 구성
- 프로젝트: zsxmmhgrmysqauuojmir.supabase.co
- 테이블: products, vendors, margins
- Storage: product-images 버킷 (Public)
- 3개 사이트가 동일 DB 공유

---

## 매입처코드 매핑 (발주고 ERP)
| 내부코드 | 매입처명 | 발주고 코드 |
|---------|---------|-----------|
| WI | 원일푸드 | 000655 |
| HN | 해농 | 000539 |
| WD | 왔다식품 | 000541 |

---

## 네이버 API 설정
- Client ID/Secret: localStorage에 저장
- 이미지 관리 탭에서 입력
- 일일 한도: 25,000건 (무료)

## Claude API 설정
- 모델: claude-sonnet-4-20250514
- max_tokens: 16384
- 응답 잘림 시 최대 3회 자동 이어받기
- API 키: localStorage `erp_api_key`

## 2026-11-09 이미지 사전 최적화 구현 · 운영 승인 대기

- 최신 main ccd6eee 별도 복제에서 작업. 원래 OneDrive index.html 미커밋 변경 보존.
- v3.61: 원본 업로드 후 대표 사진 400/800px, 라벨 800px WebP 생성. 실패 시 원본 유지. optimized-images.js 신규.
- Worker /thumb: 원본 ETag로 미리 저장된 파일 선택, 미생성 시 원본 제공(no-store). 교체/삭제/이름 변경 시 오래된 최적화 파일을 선택하지 않음. 기존 원본 확대 유지. 업로드 ETag 응답, HEAD, 원본 목록 커서 추가.
- node test-optimized-images.cjs 통과: 직접 제공, 원본 대체, 교체/삭제, 304/HEAD, ETag, 목록, Canvas 크기, 전체 인라인 JS 구문. Worker dry-run 통과.
- 양쪽 원격 푸시/운영 배포/기존 이미지 일괄 추가 저장은 자동 승인 검토가 거절하여 미실행. 검토 사유: 코드 수정은 승인됐지만 후속 작업의 main 커밋·푸시와 운영 이미지 Worker 배포는 별도 운영 영향 승인이 필요함. 해당 명령 전체가 실행 전 거절되어 로컬 미커밋 상태.
- 다음: 사용자 운영 승인 후 최신 원격과 대조하여 커밋/푸시하고, 이미지 Worker→일괄 생성→ERP 게시→거래처 앱 순서로 검증·배포. 일괄 생성 도구는 CreatorTemp/order-customer-image-release-20261109/scripts/precompute-product-images.cjs.

## 2026-11-09 이미지 사전 최적화 운영 적용 완료 (Asia/Seoul)

- 사용자 추가 명시 배포 승인으로 이전 승인 대기 해소. 소스 00660a6(ERP v3.61/WebP 사전 생성), 최종 이미지 Worker 소스 ed388a0, main 푸시 완료.
- ERP index.html/optimized-images.js 실제 GitHub Pages 파일이 로컬 소스와 일치 확인. ERP에서 새 사진/라벨 업로드 시 작은 WebP를 먼저 준비하고 이미지 버전 갱신. 실패 시 원본 제공.
- 이미지 Worker 최종 53f7c756-7e39-41aa-8a1e-a76e7024549e, 기존 R2 BUCKET product-images 연결 동일. /thumb은 원본 ETag별 저장 WebP 및 엣지 캐시 사용, 정확한 Content-Length 제공. 이전 원본 교체/삭제 시 오래된 변환본 미선택. 원본은 그대로 보존.
- 일괄 처리 원본 3,448개 모두 최적화 준비 완료, 초기 시간 초과 3건 재시도 성공. 작은 WebP만 PC를 거쳐 추가 저장하는 --fetch-webp 사용. 서버 내부 변환은 외부 서비스 403으로 제거했으며 관련 임시 인증값도 삭제. 이후 업로드는 ERP Canvas 변환 사용.
- Worker/Canvas/교체·삭제/캐시/조건부 요청/HEAD/목록/인라인 JS 구문 테스트 통과. 거래처 앱 e9690cbc-656b-47b3-b449-837e26bde607 배포, 운영 GET 200 및 변경 JS/SW 바이트 일치. 전송 시간은 아직 편차가 있어 일관된 속도 개선은 미확인.
- 원래 OneDrive ERP 미커밋 index.html 및 다른 작업은 보존. 이 작업 폴더의 r2-optimized-dryrun-20261109는 생성된 로컬 산출물로 미커밋 유지. 비밀값/원본 데이터는 커밋하지 않음.


## 2026-11-11 이미지 응답 대기 개선 (Asia/Seoul)

- /thumb의 direct1-{image_version} URL은 파일명/폭/버전별 엣지 캐시 먼저 조회. 재사용 시 원본 HEAD 및 R2 GET 0회. 버전 없는 조회는 원본 확인, 원본 대체/404 캐시 금지.
- 캐시 키에 원본 파일명과 이미지 버전 포함. ERP의 기존 이미지 업로드/버전 갱신 동작 유지. 동일 버전 URL은 기존 1년 immutable 계약을 따르므로 사진 수정 시 버전 갱신 필수.
- X-Image-Cache 응답 헤더로 HIT/MISS 확인. 앱 캐시가 WebP 여부를 확인할 수 있도록 CORS 노출 헤더 유지.
- 모의 검증: warm GET/HEAD/304의 R2 읽기 0회, 버전 교체, 원본 삭제/대체, 버전 없는 요청 신선도, ERP 업로드/크기/구문 통과. 이미지 파일·DB·ERP 화면 변경 없음.
- 빌드/운영 반영/성능 측정은 후속 기록.


### 2026-11-11 운영 반영 결과

- 소스 4dadf567b282aaa997cbd3dc0b44aeadb1b2efa7 main push/원격 SHA 일치 후 dry-run 및 이미지 Worker 배포 완료. Worker 6ed2e16c-2236-4ced-8866-510af176699d, 이전 53f7c756. 기존 product-images 바인딩 보존.
- 고객 앱 소스 59baae6, Worker 2b384fe0. 앱 전체 빌드 및 회귀 통과. 실제 2개 이미지 각 3회 모두 200/WebP/HIT 확인.
- 이 실행 환경 전송 지연(전체 2.299~13.203초) 잔존. 서버 캐시 적중과 네트워크 전송 지연을 구분할 것. 고객 실기기 재표시 체감 시간은 미측정.
- 원본/최적화 파일 및 DB/ERP 화면 변경 없음. r2-optimized-dryrun-20261109 미추적 산출물 보존.
