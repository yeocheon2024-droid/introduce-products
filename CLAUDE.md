# ERP 품목 관리 시스템 — 영업부 + 구매부

> **소속 부서**: 구매부(ERP, DB, 발주서) + 영업부(견적분석, 가격비교, 카탈로그, 전단지, 쇼케이스)
> **상위 문서**: ../CLAUDE.md (전체 에이전트 시스템 총괄)

식품/유통 업체를 위한 AI 기반 ERP 품목 관리 시스템.

## 기술 스택
| 구분 | 스택 |
|------|------|
| 메인 ERP | Vanilla HTML/CSS/JS (단일 파일 `index.html`) |
| 관련 사이트 | Next.js 14 + TypeScript + Tailwind |
| DB | Supabase (클라우드) + localStorage (로컬) |
| 이미지 | Supabase Storage (`product-images` 버킷) |
| AI | Claude API (`claude-sonnet-4-20250514`) |
| 라이브러리 | SheetJS, Supabase JS v2, html2canvas |
| 배포 | GitHub Pages (ERP), Cloudflare Pages (관련 사이트) |

## 폴더 구조
```
index.html                    ← 메인 ERP앱 (~5500줄)
default-products.js           ← 기본 품목 189개
product-catalog-price/        ← 가격표 카탈로그 (Next.js)
product-flyer/                ← 전단지 생성기 (Next.js)
product-site/                 ← 제품 소개 (Next.js)
08 발주서 예시파일/            ← 발주고 엑셀 샘플
```

## 배포
| 사이트 | GitHub 레포 | URL |
|--------|-------------|-----|
| 메인 ERP | yeocheon2024-droid/introduce-products | yeocheon2024-droid.github.io/introduce-products/ |
| 가격표 카탈로그 | yeocheon2024-droid/product-catalog-price | product-catalog-price.pages.dev |
| 전단지 생성기 | yeocheon2024-droid/product-flyer | product-flyer.pages.dev |
| 제품 소개 | yeocheon2024-droid/product-catalog | product-catalog-4qg.pages.dev |

## 핵심 규칙
1. GitHub **public** 저장소 — API 키를 코드에 넣지 말 것 (Supabase anon key만 예외)
2. **수정사항 반영 시 반드시 사이드바 버전 번호를 올릴 것** (예: v2.9 → v2.10)
3. 자동 동기화는 **양방향 병합** — 로컬 품목을 Supabase에 자동 업로드 (유실 방지)
4. 발주서 엑셀 업로드 시 **단가는 입력하지 않음** — 등록된 품목의 매입단가(cost)에서 자동 적용
5. `default-products.js` 수정 시 localStorage 갱신 플래그(`price_updated_vN`) 버전업 필요
6. 관련 사이트 `.env.local`에 Supabase 키 필요: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 주요 기능 (12개 탭)
대시보드 | 품목관리 | 매입처 | 분류체계 | 마진율 | 이미지관리 | 엑셀업로드 | 견적서분석 | ERP내보내기 | 가격비교 | 발주/견적기록 | Supabase설정

## 상세 문서
- @.claude/database.md — DB 스키마, 동기화 패턴, 단가 구조, 품목코드 규칙
- @.claude/api-design.md — Supabase REST 쿼리, Claude API, 견적서 매칭 로직
- @.claude/ui-design.md — 디자인 시스템, 탭 구조, 관련 사이트 상세
- @.claude/testing.md — 수동 테스트 체크리스트, 배포 전 확인사항
