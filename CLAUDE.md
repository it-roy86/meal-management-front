# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Response Language
- Always respond in Korean (모든 답변과 설명은 항상 한국어로 작성).
- Provide code comments, commit messages, and explanations in Korean.

## Commands

```sh
npm install       # 의존성 설치
npm run dev       # 개발 서버 실행 (Vite, /api/* → localhost:8080 프록시)
npm run build     # 프로덕션 빌드 (dist/ 생성)
npm run preview   # 빌드 결과 로컬 미리보기
```

테스트/린트 스크립트는 아직 구성되어 있지 않다 (`package.json`에 `dev`/`build`/`preview`만 존재).

로컬 개발 시 백엔드(Spring Boot)가 `localhost:8080`에서 떠 있어야 `/api/*` 요청이 정상 동작한다 (`vite.config.js`의 `server.proxy` 참고).

## 아키텍처

**스택**: Vue 3 (Options API, `<script>` 블록 사용, `<script setup>` 아님) + Vue Router 5 + Vite. 상태관리 라이브러리(Vuex/Pinia)는 없음 — 각 뷰가 자체 `data()`로 상태를 들고 있고, 로그인 세션 표시용 정보만 `localStorage`(`role`, `username`)로 전역 공유한다.

**인증/권한 모델**: 역할은 `ADMIN`, `OPERATOR`, `VIEWER` 세 가지.
- 로그인은 두 방식: ADMIN/OPERATOR는 아이디+비밀번호(`POST /api/auth/login`), VIEWER(경리담당자)는 회사 선택 + 사업자번호 뒤 4자리(`POST /api/auth/viewer-login`)로 별도 계정 없이 로그인한다.
- JWT는 **httpOnly 쿠키**로 관리한다 (2026-09-13부터, 백엔드 `AuthController`가 `Set-Cookie`로 내려줌). 로그인 응답 본문에는 `role`/`username`만 들어있고 토큰 값 자체는 JS로 접근할 수 없다. `src/api/axios.js`는 `withCredentials: true`만 설정하면 되고, 별도로 `Authorization` 헤더를 붙이지 않는다. 로그아웃은 `POST /api/auth/logout`을 호출해 서버가 쿠키를 만료시켜야 한다 (JS로 쿠키를 직접 지울 수 없음 — `DashboardView.vue`의 `logout()` 참고).
- 로그인 성공 시 `role`/`username`만 `localStorage`에 저장한다(화면 분기·표시용, 인증 자체는 쿠키가 담당). 응답 인터셉터가 401을 감지하면 이 `localStorage` 값을 비우고 `/`(로그인 화면)로 강제 이동시킨다.
- **라우터에 네비게이션 가드가 있다** (`src/router/index.js`의 `router.beforeEach`). 각 라우트의 `meta.roles`에 허용 role 목록을 선언해두고, `localStorage.role`이 없으면 로그인 화면으로, role이 있지만 현재 화면의 허용 role이 아니면 자기 role의 기본 화면(`HOME_BY_ROLE`)으로 되돌린다. httpOnly 쿠키는 JS로 존재 여부를 확인할 수 없어서 "로그인 여부" 판단은 `role` 값으로 대신한다 — 실제 쿠키가 만료/위조됐는지는 API 호출 시 백엔드가 401로 걸러낸다. 어느 쪽이든 이건 UX 방어선일 뿐이고 실제 데이터 접근 권한은 여전히 백엔드(Spring Security)가 최종 검증한다.
- 화면 안에서도 여전히 `localStorage.getItem('role')`을 직접 읽어 메뉴/버튼 노출 여부와 조회 범위를 세밀하게 분기한다(예: `DashboardView.vue`의 메뉴 카드 `v-if`, `MealView.vue`의 회사 선택 필터/수정 버튼). 새 화면을 추가하거나 권한 로직을 바꿀 때는 라우터의 `meta.roles`와 뷰 내부의 `role` 분기를 **둘 다** 확인해야 한다.

**폴더 구조**: `src/views/<기능>/`로 화면을 기능별로 묶는다 — `auth`(로그인), `dashboard`(메인 메뉴), `setting`(회사/팀/단가 관리, ADMIN 전용), `meal`(`MealInputView`: 일일 식사 입력용 OPERATOR 화면, `MealView`: 현황 조회 — 역할에 따라 조회 범위가 달라짐), `settlement`(월별 정산, ADMIN/VIEWER). 모든 라우트는 `router/index.js`에 지연 로딩(`() => import(...)`)으로 등록되어 있다.

**API 통신**: `src/api/axios.js`의 공용 axios 인스턴스(`baseURL: ''`)를 모든 뷰가 직접 import해서 사용한다(별도 서비스/스토어 레이어 없음). 컴포넌트에서 상대경로 import(`../../api/axios`)를 쓰며, `jsconfig.json`에 `@/*` alias가 정의되어 있지만 `vite.config.js`에는 대응하는 `resolve.alias`가 없어 실제로는 동작하지 않는다 — 새 코드에서 `@/` import를 쓰지 말 것.

**금액 계산 로직**: 식사 입력/조회 화면에서 중식·석식 금액은 항상 `팀별 단가 × 인원수`로 프론트에서 계산해 보여준다(`computed` 사용). 단가(`lunchPrice`, `dinnerPrice`)는 팀 선택 시 함께 내려오는 팀 객체에 포함되어 있다.

**배포**: `Dockerfile`은 2단계 빌드 — Node로 `npm run build` 후 `nginx:alpine`에 `dist/`를 서빙. `nginx.conf`가 SPA history 모드 fallback(`try_files ... /index.html`)과 `/api/` → `backend:8080` 프록시를 처리한다(로컬 Vite 프록시와 동일한 역할을 프로덕션에서는 Nginx가 대신함).
