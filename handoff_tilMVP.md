# ArtLink Handoff Document (~ MVP)

> 작성일: 2026-03-04
> 목적: 다음 세션에서 중단 없이 이어 작업하기 위한 전체 현황 정리

---

## 1. 프로젝트 개요

ArtLink는 **갤러리와 아티스트를 이어주는 모바일 웹(PWA) 플랫폼**입니다.
- 기술 명세: `CLAUDE.md`
- 아키텍처: `architecture.md`
- 개발자 가이드: `docs/developer-guide.md`
- 레퍼런스 디자인: `ref_pic/home.jpg` (클린 화이트, 대형 Hero, 미니멀 갤러리 스타일)

---

## 2. 기술 스택 & 환경 제약

| 항목 | 선택 | 비고 |
|------|------|------|
| Frontend | React 19 + Vite 7 + TypeScript | |
| CSS | Tailwind CSS **v4** | `@import "tailwindcss"` 문법, `@tailwindcss/vite` 플러그인 |
| 상태관리 | TanStack Query v5 (서버) + Zustand v5 (클라이언트) | |
| 라우팅 | React Router v6 | |
| 애니메이션 | Framer Motion | |
| 아이콘 | Lucide React | |
| Backend | Express + TypeScript | |
| ORM | Prisma **v5** | **v7은 breaking change (datasource url 제거) → 사용 금지** |
| DB (개발) | **SQLite** | Docker 미설치 환경이라 PostgreSQL 대신 사용 |
| DB (프로덕션) | PostgreSQL 16 | `docker-compose.yml` 준비됨 |
| 인증 | JWT + 개발용 퀵 로그인 | 추후 OAuth 교체 가능 구조 |

---

## 3. 실행 방법

```bash
# 원클릭 실행
bash run_web.sh

# 또는 수동 실행
cd backend && npm install && npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts
cd backend && npx tsx src/index.ts          # API: http://localhost:4000
cd frontend && npm install && npx vite      # UI:  http://localhost:5173
```

**개발용 계정 (seed 데이터):**

| ID | 이름 | 이메일 | 역할 |
|----|------|--------|------|
| 1 | Artist 1 | artist1@artlink.com | ARTIST |
| 2 | Artist 2 | artist2@artlink.com | ARTIST |
| 3 | Gallery Owner | gallery@artlink.com | GALLERY |
| 4 | Admin | admin@artlink.com | ADMIN |

**DB seed 현황:** 4유저, 3갤러리, 2공모, 3히어로슬라이드, 2리뷰, 2혜택, 2이달의갤러리, 1포트폴리오

---

## 4. 구현 완료 현황 (Phase 1~7, 9)

### Phase 1: 프로젝트 스캐폴딩 ✅
- Vite + React + TS 프론트엔드 (`frontend/`)
- Express + TS + Prisma 백엔드 (`backend/`)
- Tailwind CSS v4, `@/*` path alias
- `run_web.sh`, `.gitignore`, `.env.example`, `docker-compose.yml`

### Phase 2: DB & 백엔드 코어 ✅
- **Prisma 스키마 14 모델**: User, Gallery, GalleryImage, Exhibition, PromoPhoto, HeroSlide, Benefit, GalleryOfMonth, Review, Favorite, Portfolio, PortfolioImage, Application, ApprovalRequest
- **Express 서버**: CORS, JSON, morgan, 에러핸들러, 정적 파일(uploads)
- **11개 라우트 모듈**: auth, hero, gallery, exhibition, review, favorite, portfolio, approval, benefit, galleryOfMonth, upload
- Seed 데이터 (4유저 + 샘플 데이터)

### Phase 3: 인증 ✅
- `POST /api/auth/dev-login` — userId로 JWT 발급
- `GET /api/auth/me` — 현재 유저 조회
- `GET /api/auth/dev-users` — 로그인 화면용 유저 목록
- `authenticate` / `optionalAuth` / `authorize('ROLE')` 미들웨어
- Zustand `authStore` (localStorage persist) + Axios 인터셉터

### Phase 4: 홈페이지 ✅
- **SplashScreen**: 1.5초, Framer Motion 로고 애니메이션
- **Navbar**: sticky, 반응형 (모바일 햄버거), 활성 메뉴 하이라이트, 로그인 유저 표시
- **HeroSlider**: 자동 3초 슬라이드, 수동 조작 시 타이머 리셋, 좌하단 텍스트, 우하단 "바로가기"
- **CenterCatchphrase**: "갤러리와 아티스트를 잇다 : ArtLink"
- **QuickActionCards**: 3장 (갤러리찾기/공고/혜택), Lucide 아이콘, hover 효과
- **GalleryOfMonth**: 가로 스크롤 카드, 갤러리 이름/주소/별점

### Phase 5: 갤러리 기능 ✅
- **GalleriesPage**: 1줄1개 리스트, 지역/별점 필터, 필터칩 표시, 별점순 정렬, 찜하기, 스켈레톤 로딩
- **GalleryDetailPage**: 이미지 슬라이더, 찜하기(우상단), 기본정보, 상세소개(오너만 수정), 진행중 공모(D-day), 리뷰 섹션
- **리뷰**: Artist 전용 작성(별점/텍스트/익명), 익명시 "익명의 예술가 N", Admin 삭제 버튼, 별점 자동 재계산

### Phase 6: 공모 기능 ✅
- **ExhibitionsPage**: D-day 남은 것만 표시, 지역/갤러리별점 필터, 확장형 카드(Framer Motion), 지원하기(Artist)

### Phase 7: 마이페이지 ✅
- **공통**: 프로필 카드, 로그아웃, 역할별 탭 자동 전환
- **Artist 탭**: 포트폴리오(약력/전시이력 수정), 찜목록(갤러리/공모 분리 필터, 즉시 제거), 내 리뷰, 지원내역(stub)
- **Gallery 탭**: 내 갤러리(상태 표시: 대기/승인/거절+사유), 내 공모(stub)
- **Admin 탭**: 승인큐(승인/거절+사유필수), 히어로 관리(목록/삭제), 혜택 관리(목록/삭제), 이달의 갤러리(목록/삭제)

### Phase 9: 혜택 페이지 ✅
- Admin 등록 혜택 카드 리스트, 이미지/제목/설명/외부링크

---

## 5. 검증 결과

```
Frontend 빌드: ✅ (507KB JS, 30KB CSS)
Backend API 10개 엔드포인트:
  1. Health Check ✅
  2. Dev Login ✅
  3. Gallery List (3개) ✅
  4. Gallery Detail + Reviews ✅
  5. Exhibitions (2개) ✅
  6. Hero Slides (3개) ✅
  7. Gallery of Month (2개) ✅
  8. Benefits (2개) ✅
  9. Favorite Toggle ✅
  10. Portfolio ✅
```

---

## 6. 미구현 항목 (다음 세션 작업 대상)

### Phase 8: Admin 상세 기능 (중요도 높음)
- [ ] 히어로 슬라이드 **신규 등록 폼** (Title/Description/Link/이미지 업로드 + 미리보기)
- [ ] 히어로 슬라이드 **수정 폼**
- [ ] 히어로 슬라이드 **순서 변경** (드래그 or 화살표)
- [ ] 혜택 **신규 등록/수정 폼** + 미리보기
- [ ] 이달의 갤러리 **갤러리 검색→선정** + 기한 설정
- [ ] 갤러리 등록 요청 **신규 등록 폼** (Gallery 유저: 이름/주소/소개/대표자/전화/이미지/지역태그)
- [ ] 공모 등록 요청 **신규 등록 폼** (Gallery 유저: 갤러리선택/제목/구분/마감일/전시일/인원/지역/소개)
- [ ] 수정 요청 기능 (Gallery→Admin)
- [ ] 이달의 갤러리 **자동 만료 삭제** (현재 API 레벨에서만 처리, cron 미구현)

### Phase 10: PWA & 폴리시
- [ ] `vite-plugin-pwa` 적용, manifest.json, service worker
- [ ] 페이지 전환 애니메이션 (현재 기본 fade만 있음)
- [ ] 스켈레톤 로딩 전 페이지 통일
- [ ] Toast 알림 (react-hot-toast 등)
- [ ] 프로필 사진 변경 기능 (파일 업로드 연동)
- [ ] 전시 종료 후 홍보용 사진/후기 등록 기능
- [ ] Application 내역 조회 API (`GET /api/applications/my`)
- [ ] Gallery 유저 내 공모 목록 API
- [ ] Vitest 단위 테스트 + 통합 테스트
- [ ] 모바일 반응형 세부 조정

### 알려진 제약/이슈
- `GalleriesPage`에서 `isFavorited` 필드는 현재 비인증 요청에서 항상 undefined (optionalAuth 미적용 상태)
- `MyPage > ApplicationsSection`은 stub (백엔드에 my-applications 엔드포인트 없음)
- `MyPage > MyExhibitionsSection`은 stub
- `Gallery 유저`의 갤러리/공모 등록 폼 UI 미구현 (API는 존재)
- 이미지 업로드 UI는 없음 (backend upload route는 존재)
- 프론트엔드 chunk가 500KB 초과 → code splitting 필요

---

## 7. 파일 맵 (전체 구조)

```
ArtLink/
├── CLAUDE.md                          # 기술 명세 (변경 금지)
├── architecture.md                    # 아키텍처 문서 (지속 업데이트)
├── handoff_tilMVP.md                  # 이 문서
├── docker-compose.yml                 # PostgreSQL (프로덕션용)
├── run_web.sh                         # 로컬 원클릭 실행
├── .gitignore
├── .env.example
├── .claude/settings.json              # 모든 권한 허용 설정
├── docs/developer-guide.md
├── ref_pic/home.jpg                   # 디자인 레퍼런스
│
├── frontend/
│   ├── vite.config.ts                 # Vite + Tailwind v4 + proxy 설정
│   ├── tsconfig.json                  # @/* path alias
│   ├── package.json
│   └── src/
│       ├── main.tsx                   # 엔트리 (BrowserRouter + QueryClientProvider)
│       ├── App.tsx                    # 라우팅, SplashScreen 전환
│       ├── index.css                  # Tailwind v4 @import + 커스텀 테마
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Layout.tsx         # Navbar + Outlet
│       │   │   └── Navbar.tsx         # 반응형 네비게이션
│       │   ├── home/
│       │   │   ├── SplashScreen.tsx   # 로고 애니메이션 (1.5초)
│       │   │   ├── HeroSlider.tsx     # 자동/수동 슬라이더
│       │   │   ├── QuickActionCards.tsx
│       │   │   └── GalleryOfMonth.tsx # 가로 스크롤 카드
│       │   └── shared/
│       │       └── ProtectedRoute.tsx # 인증 가드
│       ├── pages/
│       │   ├── HomePage.tsx           # Hero + 캐치프레이즈 + QA카드 + GOTM
│       │   ├── LoginPage.tsx          # 개발용 퀵 로그인
│       │   ├── GalleriesPage.tsx      # 갤러리 목록 + 필터
│       │   ├── GalleryDetailPage.tsx  # 갤러리 상세 + 리뷰
│       │   ├── ExhibitionsPage.tsx    # 공모 목록 + 확장 카드
│       │   ├── BenefitsPage.tsx       # 혜택 목록
│       │   └── MyPage.tsx             # 역할별 탭 (Artist/Gallery/Admin)
│       ├── stores/
│       │   └── authStore.ts           # Zustand + localStorage persist
│       ├── lib/
│       │   ├── axios.ts               # API 인스턴스 + JWT 인터셉터
│       │   ├── queryClient.ts         # TanStack Query 설정
│       │   └── utils.ts               # cn(), getDday(), 라벨 매핑
│       └── types/
│           └── index.ts               # 공유 TypeScript 인터페이스
│
└── backend/
    ├── tsconfig.json
    ├── package.json
    ├── .env                           # DATABASE_URL, JWT_SECRET, PORT
    ├── prisma/
    │   ├── schema.prisma              # 14 모델 (Single Source of Truth)
    │   ├── seed.ts                    # 초기 데이터
    │   └── dev.db                     # SQLite 데이터베이스
    ├── uploads/                       # 이미지 업로드 디렉토리
    └── src/
        ├── index.ts                   # Express 서버 엔트리
        ├── lib/
        │   └── prisma.ts              # Prisma 싱글톤
        ├── middleware/
        │   ├── auth.ts                # authenticate, optionalAuth, authorize
        │   └── errorHandler.ts        # AppError + 글로벌 에러 핸들러
        └── routes/
            ├── auth.ts                # dev-login, me, dev-users
            ├── hero.ts                # 히어로 CRUD
            ├── gallery.ts             # 갤러리 목록/상세/등록/수정
            ├── exhibition.ts          # 공모 목록/상세/등록/지원
            ├── review.ts              # 리뷰 CRUD + 별점 재계산
            ├── favorite.ts            # 찜 토글 + 목록
            ├── portfolio.ts           # 포트폴리오 CRUD
            ├── approval.ts            # 승인 큐 (Admin)
            ├── benefit.ts             # 혜택 CRUD
            ├── galleryOfMonth.ts      # 이달의 갤러리 (자동 만료)
            └── upload.ts              # Multer 이미지 업로드
```

---

## 8. 다음 세션 권장 작업 순서

1. **Phase 8 Admin 상세 CRUD** — 등록 폼 + 미리보기가 가장 큰 미구현 덩어리
2. **Gallery 유저 등록 폼** — 갤러리/공모 등록 요청 UI (API는 이미 존재)
3. **이미지 업로드 연동** — upload route 존재, 프론트 UI만 필요
4. **누락 API 추가** — `GET /api/applications/my`, Gallery 유저 내 공모 목록
5. **PWA + 폴리시** — manifest, service worker, toast, 스켈레톤 통일
6. **테스트** — Vitest 단위 + 통합 (등록→승인→검색→지원 흐름)

---

## 9. 주의사항

- **Prisma v5 유지 필수** — v7은 `datasource url` 제거 breaking change
- **Tailwind CSS v4 문법** — `@import "tailwindcss"` (NOT `@tailwind base/components/utilities`)
- **SQLite 사용 중** — Docker 미설치 환경. PostgreSQL 전환 시 `DATABASE_URL`만 변경 + `prisma migrate`
- **권한 설정** — `.claude/settings.json`에 모든 도구 허용 설정 완료
