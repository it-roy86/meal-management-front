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

**스택**: Vue 3 (Options API, `<script>` 블록 사용, `<script setup>` 아님) + Vue Router 5 + Vite. 상태관리 라이브러리(Vuex/Pinia)는 없음 — 각 뷰가 자체 `data()`로 상태를 들고 있고, 로그인 세션만 `localStorage`(`token`, `role`, `username`)로 전역 공유한다.

**인증/권한 모델**: 역할은 `ADMIN`, `OPERATOR`, `VIEWER` 세 가지.
- 로그인은 두 방식: ADMIN/OPERATOR는 아이디+비밀번호(`POST /api/auth/login`), VIEWER(경리담당자)는 회사 선택 + 사업자번호 뒤 4자리(`POST /api/auth/viewer-login`)로 별도 계정 없이 로그인한다.
- 로그인 성공 시 JWT를 `localStorage.token`에 저장하고, `src/api/axios.js`의 요청 인터셉터가 모든 요청에 `Authorization: Bearer` 헤더를 자동으로 붙인다. 응답 인터셉터가 401을 감지하면 localStorage를 비우고 `/`(로그인 화면)로 강제 이동시킨다.
- **라우터에는 네비게이션 가드가 없다** (`src/router/index.js`). 역할별 접근 제어는 각 뷰 컴포넌트가 `localStorage.getItem('role')`을 직접 읽어 메뉴/버튼 노출 여부와 조회 범위를 분기하는 방식으로만 이루어진다(예: `DashboardView.vue`의 메뉴 카드 `v-if`, `MealView.vue`의 회사 선택 필터/수정 버튼). 새 화면을 추가하거나 권한 로직을 바꿀 때 라우터가 아니라 뷰 내부의 `role` 분기를 확인해야 한다.

**폴더 구조**: `src/views/<기능>/`로 화면을 기능별로 묶는다 — `auth`(로그인), `dashboard`(메인 메뉴), `setting`(회사/팀/단가 관리, ADMIN 전용), `meal`(`MealInputView`: 일일 식사 입력용 OPERATOR 화면, `MealView`: 현황 조회 — 역할에 따라 조회 범위가 달라짐), `settlement`(월별 정산, ADMIN/VIEWER). 모든 라우트는 `router/index.js`에 지연 로딩(`() => import(...)`)으로 등록되어 있다.

**API 통신**: `src/api/axios.js`의 공용 axios 인스턴스(`baseURL: ''`)를 모든 뷰가 직접 import해서 사용한다(별도 서비스/스토어 레이어 없음). 컴포넌트에서 상대경로 import(`../../api/axios`)를 쓰며, `jsconfig.json`에 `@/*` alias가 정의되어 있지만 `vite.config.js`에는 대응하는 `resolve.alias`가 없어 실제로는 동작하지 않는다 — 새 코드에서 `@/` import를 쓰지 말 것.

**금액 계산 로직**: 식사 입력/조회 화면에서 중식·석식 금액은 항상 `팀별 단가 × 인원수`로 프론트에서 계산해 보여준다(`computed` 사용). 단가(`lunchPrice`, `dinnerPrice`)는 팀 선택 시 함께 내려오는 팀 객체에 포함되어 있다.

**배포**: `Dockerfile`은 2단계 빌드 — Node로 `npm run build` 후 `nginx:alpine`에 `dist/`를 서빙. `nginx.conf`가 SPA history 모드 fallback(`try_files ... /index.html`)과 `/api/` → `backend:8080` 프록시를 처리한다(로컬 Vite 프록시와 동일한 역할을 프로덕션에서는 Nginx가 대신함).
