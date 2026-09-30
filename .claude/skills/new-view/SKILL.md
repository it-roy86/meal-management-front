---
name: new-view
description: meal-management-front(Vue 3)의 기존 화면 패턴을 그대로 따라 새 화면(View)을 만들고 라우터 등록(meta.roles), 대시보드 메뉴 카드까지 한 번에 연결합니다. "/new-view 화면이름" 형태로 호출하세요 (예: /new-view Notice).
---

# /new-view — 신규 화면 자동 생성 스킬

이 스킬은 `$0`으로 전달받은 화면 이름을 기준으로, 이 저장소(`meal-management-front`)에
이미 존재하는 `MealView` / `SettlementView` / `DashboardView` 코드의 패턴을 그대로 따라서
화면 컴포넌트를 만들고, 라우터와 대시보드 메뉴에 연결한다.

**인자**: `$0` = 생성할 화면 이름 (PascalCase 권장, 예: `Notice`, `MealPlan`).
- `$0`이 비어 있으면, 생성하지 말고 사용자에게 화면 이름을 먼저 물어볼 것.
- `$0`이 camelCase/kebab-case/한글 등으로 들어와도 PascalCase로 정규화해서 사용할 것
  (예: `meal-plan` → `MealPlan`, `mealPlan` → `MealPlan`).
- `$0` 끝에 `View`가 붙어 있으면 떼고 사용할 것 (`NoticeView` → `Notice` → 컴포넌트명 `NoticeView`).

## 0단계 — 먼저 확인할 것 (추측 금지)

아래 항목이 프롬프트나 대화에서 명확하지 않으면 **코드를 생성하기 전에 간단히 사용자에게 물어볼 것**.
억지로 추측해서 화면 구성이나 권한을 만들어내지 말 것 (특히 권한은 틀리면 보안/UX 문제로 이어짐):

1. **접근 가능한 역할** — `ADMIN` / `OPERATOR` / `VIEWER` 중 누가 들어올 수 있는지 (라우터 `meta.roles`)
2. **역할별 화면 내부 차이** — 같은 화면이라도 역할에 따라 달라지는 부분이 있는지
   (예: `MealView`처럼 ADMIN만 회사 선택 필터/수정 버튼이 보임)
3. **화면 유형** — 조회 화면(검색 조건 + 결과 목록), 입력 화면(폼 + 저장), 또는 둘 다인지
4. **사용할 API** — 호출할 엔드포인트와 요청/응답 필드. **백엔드에 아직 API가 없다면** 먼저
   백엔드 저장소(`D:\dev\meal-management`)에서 `/new-entity` 스킬 등으로 API를 만들어야 함을 안내할 것
5. **기능 폴더** — 기존 폴더(`auth`/`dashboard`/`setting`/`meal`/`settlement`) 중 어디에 속하는지, 새 폴더인지
6. **대시보드 메뉴 카드** — 추가할지, 아이콘(이모지)·제목·설명 문구는 무엇인지

정보가 이미 충분히 주어졌다면 다시 묻지 말고 바로 생성할 것.

## 1단계 — 참고 파일 다시 읽기

생성 직전에 아래 파일을 최신 상태로 다시 읽어서 패턴이 바뀌지 않았는지 확인할 것
(이 문서의 템플릿은 스냅샷이며, 실제 코드가 더 정확한 소스임):

- `src/router/index.js` — 라우트 등록 형식, 각 라우트 위 한국어 주석 스타일
- `src/router/guard.js` — `HOME_BY_ROLE` (역할별 기본 화면)
- `src/views/dashboard/DashboardView.vue` — 메뉴 카드 형식과 역할별 `v-if`
- `src/views/meal/MealView.vue` — 조회 화면 기준 (검색 카드, 결과 테이블, 모바일 카드 목록, 수정 모달)
- `src/views/settlement/SettlementView.vue` — 역할별 조회 범위 분기 기준
- 입력 화면이면 `src/views/meal/MealInputView.vue`도 참고
- `src/utils/date.js` — 날짜 기본값을 만들 때 쓸 함수

## 네이밍 규칙

`$0`을 `{Name}`으로 정규화했다고 할 때:

| 대상 | 규칙 | 예시 (`$0=MealPlan`) |
|---|---|---|
| 파일 경로 | `src/views/{feature}/{Name}View.vue` | `src/views/meal/MealPlanView.vue` |
| 컴포넌트 `name` | `{Name}View` | `MealPlanView` |
| 라우트 `path` | `/` + kebab-case | `/meal-plan` |
| 라우트 `name` | kebab-case | `meal-plan` |
| 최상위 CSS 클래스 | `{kebab}-container` | `meal-plan-container` |

## 2단계 — 화면 컴포넌트 생성

경로: `src/views/{feature}/{Name}View.vue`

**반드시 지킬 것** (이 프로젝트 전 화면 공통):
- **Options API** + `<script>` 블록 (`<script setup>`, Composition API 금지)
- 상태관리 라이브러리 없음 — 화면 상태는 자체 `data()`에, 역할은 `localStorage.getItem('role')`로 읽기
- API는 공용 axios 인스턴스 사용 (`import api from '../../api/axios'` — 기존 파일과 맞춰 상대경로 사용).
  `Authorization` 헤더를 직접 붙이지 말 것 (JWT는 httpOnly 쿠키, 401은 인터셉터가 처리)
- **날짜 문자열은 `toISOString()` 금지** — `src/utils/date.js`의 `formatDate` / `formatYearMonth` /
  `firstDayOfMonth`를 쓸 것 (UTC 기준이라 한국 시간에서 하루 밀림, 2026-09-30 수정한 버그)
- 금액은 표시할 때 `toLocaleString()` + `원`, 인원은 `명` 단위 표기
- 주석·alert 메시지는 한국어, 기존 코드처럼 "~해요" 말투

조회 화면 템플릿 (입력 화면이면 `MealInputView.vue` 구조를 따를 것):

```vue
<template>
  <div class="{kebab}-container">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-left">
        <button class="btn-home" @click="$router.push('/dashboard')">🏠 홈</button>
        <h2>{이모지} {화면 한글명}</h2>
      </div>
    </div>

    <!-- 검색 조건 -->
    <div class="search-card">
      <div class="search-row">
        <!-- TODO: 검색 조건 (.search-item > label + input/select) -->
        <button class="btn-search" @click="load{Name}s">조회</button>
      </div>
    </div>

    <!-- 조회 결과 -->
    <div class="result-card">
      <div class="result-header">
        <h3>조회 결과</h3>
        <span class="total-badge">총 {{ items.length }}건</span>
      </div>

      <!-- PC: 테이블 -->
      <table class="table">
        <thead>
        <tr>
          <!-- TODO: 컬럼 -->
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in items" :key="item.id">
          <!-- TODO: 셀 -->
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="{컬럼 수}" class="empty">조회된 데이터가 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <!-- 모바일: 카드 목록 (768px 이하에서만 보임) -->
      <div class="mobile-list">
        <div class="mobile-record-card" v-for="item in items" :key="item.id">
          <!-- TODO: 카드 내용 -->
        </div>
        <div v-if="items.length === 0" class="empty">조회된 데이터가 없습니다.</div>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../../api/axios'

export default {
  name: '{Name}View',
  data() {
    return {
      // 현재 로그인한 역할
      role: localStorage.getItem('role'),

      // 검색 조건
      search: {
        // TODO: 날짜 기본값은 utils/date 함수로 (toISOString 금지)
      },

      // 조회 결과 목록
      items: []
    }
  },

  async mounted() {
    // 화면 진입 시 바로 조회
    await this.load{Name}s()
  },

  methods: {
    /**
     * {화면 한글명} 목록 조회
     * GET /api/{kebab-plural}
     */
    async load{Name}s() {
      try {
        const response = await api.get('/api/{kebab-plural}', { params: this.search })
        this.items = response.data
      } catch (error) {
        console.error('{화면 한글명} 조회 실패', error)
        alert('{화면 한글명}을(를) 불러오는데 실패했습니다.')
      }
    }
  }
}
</script>

<style scoped>
/* MealView.vue의 스타일(.header, .btn-home, .search-card, .result-card, .table, .empty 등)을
   그대로 가져와서 맞출 것 — 화면 간 모양이 달라지지 않게. */

/* PC에서는 모바일 카드 숨기기 */
.mobile-list {
  display: none;
}

@media (max-width: 768px) {
  /* 여기에는 "모바일에서 달라지는 것"만 넣을 것 */
  .table { display: none; }
  .mobile-list { display: flex; flex-direction: column; gap: 10px; }
}
</style>
```

주의:
- 컬럼·필드를 `// TODO`로 남겨두지 말고 0단계에서 확인한 API 응답 필드로 모두 채울 것.
- **버튼·모달 등 공통 스타일을 `@media` 블록 안에 넣지 말 것.** `@media (max-width: 768px)`에는 모바일에서
  "달라지는 값"(너비, 여백, 숨김/표시 등)만 둔다. 예전 `MealView.vue`는 수정 버튼과 모달 스타일 전체가 미디어쿼리 안에
  있어서 PC에서 모달이 스타일 없이 표시됐음 (2026-10-01 수정). 지금 `MealView.vue`의 수정 버튼/모달 스타일이
  공통 스타일 + 모바일 조정(`.modal` 너비 90%)으로 나뉜 형태를 참고할 것.
- 역할별 내부 분기가 있으면 `v-if="role === 'ADMIN'"`처럼 `data()`의 `role`로 분기할 것 (MealView의 회사 필터 참고).
  단, 이건 화면 표시용일 뿐이고 실제 데이터 범위 제한은 백엔드가 해야 함 (VIEWER의 자기 회사 필터 등).

## 3단계 — 라우터 등록

`src/router/index.js`의 `routes` 배열에 추가. 기존 라우트처럼 **위에 한국어 주석**(화면 설명, 접근 가능 역할과 이유)을 달 것:

```js
    {
        // {화면 한글명} 화면 - {허용 역할} 접근 가능
        // {화면 설명 한두 줄}
        path: '/{kebab}',
        name: '{kebab}',
        component: () => import('../views/{feature}/{Name}View.vue'),
        meta: { roles: [/* 0단계에서 확인한 역할 */] }
    }
```

- 반드시 지연 로딩(`() => import(...)`)으로 등록할 것.
- `meta.roles`를 빠뜨리면 로그인한 누구나 URL로 들어올 수 있게 됨 — 빠뜨리지 말 것.
- 새 기능 폴더를 만들었다면 파일 상단 주석의 "폴더 구조" 목록에도 추가할 것.
- 이 화면이 어떤 역할의 **로그인 직후 기본 화면**이 되어야 한다면 `src/router/guard.js`의 `HOME_BY_ROLE`과
  `LoginView.vue`의 로그인 후 이동 분기를 **둘 다** 바꿔야 함 (둘이 같게 유지되어야 함). 이 경우 사용자에게 먼저 확인할 것.

## 4단계 — 대시보드 메뉴 카드 추가 (0단계에서 추가하기로 한 경우)

`src/views/dashboard/DashboardView.vue`의 `.menu-grid` 안에 추가:

```vue
      <!-- {화면 한글명} - {허용 역할} 표시 -->
      <div
          class="menu-card"
          v-if="role === 'ADMIN' || role === 'VIEWER'"
          @click="$router.push('/{kebab}')"
      >
        <div class="menu-icon">{이모지}</div>
        <div class="menu-title">{메뉴 제목}</div>
        <div class="menu-desc">{메뉴 설명}</div>
      </div>
```

- **`v-if` 조건은 3단계의 `meta.roles`와 반드시 같은 역할 목록이어야 함.** 다르면 메뉴는 보이는데 눌러도
  기본 화면으로 튕기거나(가드), 들어갈 수 있는데 메뉴가 안 보이는 상태가 됨. 모든 역할이면 `v-if`를 생략함 (현황 조회 카드 참고).

## 5단계 — 테스트 (필요한 경우)

화면 안에 계산/변환 로직(금액 합계, 날짜 계산, 데이터 가공 등)이 생기면 CLAUDE.md의 테스트 패턴을 따를 것:
- DOM에 의존하지 않는 로직은 별도 `.js` 파일(`src/utils/` 등)로 분리해서 순수 함수로 만들고 `*.test.js` 작성
- DOM이 꼭 필요하면 테스트 파일 맨 위에 `// @vitest-environment jsdom`
- 단순히 API 결과를 표시만 하는 화면이면 테스트는 생략해도 됨

## 6단계 — 마무리 체크리스트

생성 후 아래를 확인하고 사용자에게 보고할 것:
0. 생성한 코드에 `// TODO`나 `{Name}` 같은 템플릿 자리표시자가 남아있지 않은지
1. **라우터 `meta.roles` ↔ 대시보드 카드 `v-if` ↔ 화면 내부 `role` 분기**가 서로 맞는지 (CLAUDE.md에서 강조하는 부분)
2. `toISOString()`을 쓰지 않았는지 (`grep -n toISOString src/views/{feature}/{Name}View.vue`)
3. `npm run lint`와 `npm test` 통과
4. `npm run build` 통과 — 개발 서버는 파일을 빠르게 연달아 수정하면 마지막 변경을 놓칠 수 있음
   (2026-09-30에 `MealView.vue` import 누락처럼 보이는 빈 화면 발생). 빌드는 캐시 없이 새로 읽으므로 빌드 통과 여부로 확인할 것
5. 사용자가 브라우저에서 확인할 경로 안내: `http://localhost:5173/{kebab}` — 허용 역할과 **허용되지 않은 역할**로
   각각 로그인해서 메뉴 노출과 URL 직접 접근 차단까지 확인하도록 안내 (백엔드가 `localhost:8080`에서 떠 있어야 함)
6. 백엔드 API와 필드명이 맞는지 — 새 API를 쓰는 경우 백엔드 저장소 쪽 컨트롤러의 응답 필드와 대조
7. 아키텍처나 권한 구조를 바꾸는 변경(예: `HOME_BY_ROLE` 변경, 새 역할)이면 백엔드 저장소의
   `구내식당_웹앱_기획설계서.md` 히스토리 기록 대상인지 사용자에게 확인할 것
8. **파일 생성만 하고 git commit은 사용자가 명시적으로 요청하기 전까지 하지 말 것**
