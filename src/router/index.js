import { createRouter, createWebHistory } from 'vue-router'

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

// 로그인 성공 시 role별로 이동시키는 기본 화면
// LoginView.vue의 분기 로직과 동일하게 맞춰뒀어요 (역할별 화면 접근 거부 시 되돌아갈 곳으로도 사용).
const HOME_BY_ROLE = {
    ADMIN: '/dashboard',
    OPERATOR: '/meal-input',
    VIEWER: '/meal-view'
}

const router = createRouter({
    // createWebHistory: URL에 # 없이 깔끔한 경로 사용 (예: /dashboard)
    // createWebHashHistory를 쓰면 #이 붙어요 (예: /#/dashboard)
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

/**
 * 네비게이션 가드
 * 화면 이동이 실제로 일어나기 전에 실행돼요.
 * - 로그인 화면(meta.public)은 그대로 통과
 * - role이 없으면(로그인 안 함) 로그인 화면으로 되돌림
 * - role은 있지만 현재 화면의 허용 role이 아니면 자기 role의 기본 화면으로 되돌림
 *
 * JWT는 httpOnly 쿠키로 관리돼서 JS로는 존재 여부를 알 수 없어요.
 * 그래서 로그인 여부는 로그인 성공 시 함께 저장해두는 localStorage의
 * role 값으로 판단해요. 쿠키가 실제로 만료/위조됐는지는 어차피 이 값과
 * 상관없이 API 호출 시 백엔드가 401로 걸러내고, axios 인터셉터가 그때
 * 로그인 화면으로 돌려보내요 (src/api/axios.js 참고).
 */
router.beforeEach((to) => {
    if (to.meta.public) {
        return true
    }

    const role = localStorage.getItem('role')
    if (!role) {
        return '/'
    }

    const allowedRoles = to.meta.roles
    if (allowedRoles && !allowedRoles.includes(role)) {
        return HOME_BY_ROLE[role] ?? '/'
    }

    return true
})

export default router