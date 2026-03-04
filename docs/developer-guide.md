# ArtLink 개발자 가이드

## 빠른 시작

```bash
# 자동 실행 (DB + 백엔드 + 프론트엔드)
bash run_web.sh

# 또는 수동 실행
cd backend && npm install && npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts
cd backend && npx tsx src/index.ts    # 백엔드: http://localhost:4000
cd frontend && npm install && npx vite # 프론트엔드: http://localhost:5173
```

## 프로젝트 구조 가이드

### 백엔드

| 파일/디렉토리 | 설명 |
|---------------|------|
| `backend/prisma/schema.prisma` | 전체 데이터 모델 정의 (변경 시 `npx prisma db push` 필요) |
| `backend/prisma/seed.ts` | 초기 시드 데이터 (개발용 4명 유저, 샘플 갤러리/공모) |
| `backend/src/index.ts` | Express 서버 진입점, 미들웨어 및 라우트 등록 |
| `backend/src/routes/` | API 엔드포인트 (모듈별 분리, 11개 파일) |
| `backend/src/middleware/auth.ts` | JWT 인증/인가 미들웨어 (authenticate, authorize, optionalAuth) |
| `backend/src/middleware/errorHandler.ts` | 글로벌 에러 핸들러 + AppError 클래스 |
| `backend/src/lib/prisma.ts` | Prisma 싱글톤 클라이언트 |

### 프론트엔드

| 파일/디렉토리 | 설명 |
|---------------|------|
| `frontend/src/App.tsx` | 메인 라우팅, 스플래시 스크린 전환 로직 |
| `frontend/src/stores/authStore.ts` | Zustand 인증 상태 (localStorage 영속화) |
| `frontend/src/lib/axios.ts` | API 호출 인스턴스 (JWT 토큰 자동 첨부, 401 자동 로그아웃) |
| `frontend/src/lib/queryClient.ts` | TanStack Query 설정 (5분 staleTime) |
| `frontend/src/components/layout/` | Navbar + Layout (전 페이지 공유) |
| `frontend/src/components/home/` | 홈페이지 전용 컴포넌트 (HeroSlider, QuickActionCards 등) |
| `frontend/src/pages/` | 라우트별 페이지 컴포넌트 |
| `frontend/src/types/index.ts` | 공유 TypeScript 타입 |

## 개발용 계정

| 이름 | 이메일 | 역할 |
|------|--------|------|
| Artist 1 | artist1@artlink.com | ARTIST |
| Artist 2 | artist2@artlink.com | ARTIST |
| Gallery Owner | gallery@artlink.com | GALLERY |
| Admin | admin@artlink.com | ADMIN |

## 주요 패턴

### 새 API 엔드포인트 추가
1. `backend/src/routes/` 에 라우트 파일 생성
2. `backend/src/index.ts` 에서 import 및 `app.use()` 등록
3. 인증 필요 시 `authenticate`, 역할 제한 시 `authorize('ROLE')` 미들웨어 추가

### 새 페이지 추가
1. `frontend/src/pages/` 에 페이지 컴포넌트 생성
2. `frontend/src/App.tsx` 의 Routes에 추가
3. 인증 필요 시 `<ProtectedRoute>` 래핑

### DB 스키마 변경
1. `backend/prisma/schema.prisma` 수정
2. `npx prisma db push` (개발) 또는 `npx prisma migrate dev` (마이그레이션 생성)
3. `npx prisma generate` (클라이언트 재생성)

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| DATABASE_URL | DB 연결 문자열 | file:./dev.db |
| JWT_SECRET | JWT 서명 키 | artlink-dev-secret |
| PORT | 백엔드 포트 | 4000 |
| FRONTEND_URL | CORS 허용 도메인 | http://localhost:5173 |

## 프로덕션 전환 가이드

1. **DB**: `docker-compose up -d` → `DATABASE_URL`을 PostgreSQL로 변경
2. **인증**: `authStore.login()` 호출부만 OAuth 콜백으로 교체
3. **파일 업로드**: `backend/src/routes/upload.ts`의 multer storage를 S3/GCS로 교체
4. **빌드**: `cd frontend && npm run build` → `dist/` 를 CDN/Nginx에서 제공
