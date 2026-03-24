# ERP 품목 관리 시스템 - 현재 상황 (2026-03-24)

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
