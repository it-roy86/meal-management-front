import { createRouter, createWebHistory } from 'vue-router'
import { resolveRouteGuard } from './guard'

/**
 * Vue Router 설정
 * 각 URL 경로와 화면(컴포넌트)을 연결해요.
 * 사용자가 특정 URL로 이동하면 해당 컴포넌트가 화면에 표시돼요.
 *
 * 폴더 구조는 기능별로 나눴어요.
 * - auth: 인증 관련 (로그인)
 * - dashboard: 메인 화면
 * - setting: 설정 관리
 * - meal: 식사 입력/조회
 *
 * 각 라우트의 meta.roles는 네비게이션 가드(아래 beforeEach)가 참고하는
 * "이 화면에 들어올 수 있는 role 목록"이에요. 화면 안에서 메뉴/버튼을
 * role로 숨기는 것과는 별개로, URL을 직접 입력해서 들어오는 것도 여기서 막아요.
 * (단, 실제 데이터 접근 권한은 백엔드 Spring Security가 최종적으로 검증해요.
 * 라우터 가드는 어디까지나 UX 개선용 방어선이에요.)
 */

const routes = [
    {
        // 로그인 화면 - 누구나 접근 가능
        // 앱 진입점이에요. 로그인 성공 시 역할별 화면으로 이동해요.
        // LoginView는 앱 시작 시 바로 필요하므로 즉시 로딩해요.
        path: '/',
        name: 'login',
        component: () => import('../views/auth/LoginView.vue'),
        meta: { public: true }
    },
    {
        // 대시보드 - 로그인한 모든 역할이 접근 가능
        // 로그인 후 ADMIN이 이동하는 메인 화면이며, 메뉴 카드는 role별로
        // 다르게 보여요 (DashboardView.vue의 v-if 참고).
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: { roles: ['ADMIN', 'OPERATOR', 'VIEWER'] }
    },
    {
        // 설정 관리 화면 - ADMIN 전용
        // 회사/팀 등록, 단가 설정, 사업자번호, 이메일 관리 화면이에요.
        // 식사 입력 화면보다 먼저 개발하는 이유는
        // 회사/팀 데이터가 없으면 식사 입력을 할 수 없기 때문이에요.
        path: '/setting',
        name: 'setting',
        component: () => import('../views/setting/SettingView.vue'),
        meta: { roles: ['ADMIN'] }
    },
    {
        // 식사 입력 화면 - ADMIN/OPERATOR 접근 가능
        // 로그인 후 OPERATOR 역할일 때 이동하는 화면이에요.
        // 어머니가 매일 식사 인원을 입력하는 화면이에요.
        path: '/meal-input',
        name: 'meal-input',
        component: () => import('../views/meal/MealInputView.vue'),
        meta: { roles: ['ADMIN', 'OPERATOR'] }
    },
    {
        // 식사 현황 조회 화면 - 로그인한 모든 역할이 접근 가능
        // 경리담당자(VIEWER)는 자기 회사 데이터만 조회할 수 있어요 (백엔드에서 필터링).
        path: '/meal-view',
        name: 'meal-view',
        component: () => import('../views/meal/MealView.vue'),
        meta: { roles: ['ADMIN', 'OPERATOR', 'VIEWER'] }
    },
    {
        // 월별 정산 화면 - ADMIN/VIEWER 접근 가능
        // 회사별 월간 식사 비용을 정산해요.
        path: '/settlement',
        name: 'settlement',
        component: () => import('../views/settlement/SettlementView.vue'),
        meta: { roles: ['ADMIN', 'VIEWER'] }
    }
]

const router = createRouter({
    // createWebHistory: URL에 # 없이 깔끔한 경로 사용 (예: /dashboard)
    // createWebHashHistory를 쓰면 #이 붙어요 (예: /#/dashboard)
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// 네비게이션 가드 판정 로직은 './guard'에 분리해뒀어요 (vue-router/DOM 의존 없이
// 단위 테스트하기 위해서 — src/router/guard.test.js 참고).
// 로그인 여부/역할 판단 방식에 대한 자세한 설명도 그 파일 주석에 있어요.
router.beforeEach((to) => resolveRouteGuard(to.meta, localStorage.getItem('role')))

export default router