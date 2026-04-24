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
 */

const router = createRouter({
    // createWebHistory: URL에 # 없이 깔끔한 경로 사용 (예: /dashboard)
    // createWebHashHistory를 쓰면 #이 붙어요 (예: /#/dashboard)
    history: createWebHistory(import.meta.env.BASE_URL),

    routes: [
        {
            // 로그인 화면 - 누구나 접근 가능
            // 앱 진입점이에요. 로그인 성공 시 역할별 화면으로 이동해요.
            // LoginView는 앱 시작 시 바로 필요하므로 즉시 로딩해요.
            path: '/',
            name: 'login',
            component: () => import('../views/auth/LoginView.vue')
        },
        {
            // 대시보드 - ADMIN 전용
            // 로그인 후 ADMIN 역할일 때 이동하는 메인 화면이에요.
            // 메뉴 카드 형태로 각 기능으로 이동할 수 있어요.
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/dashboard/DashboardView.vue')
        },
        {
            // 설정 관리 화면 - ADMIN 전용
            // 회사/팀 등록, 단가 설정, 사업자번호, 이메일 관리 화면이에요.
            // 식사 입력 화면보다 먼저 개발하는 이유는
            // 회사/팀 데이터가 없으면 식사 입력을 할 수 없기 때문이에요.
            path: '/setting',
            name: 'setting',
            component: () => import('../views/setting/SettingView.vue')
        },
        {
            // 식사 입력 화면 - OPERATOR 전용
            // 로그인 후 OPERATOR 역할일 때 이동하는 화면이에요.
            // 어머니가 매일 식사 인원을 입력하는 화면이에요.
            path: '/meal-input',
            name: 'meal-input',
            component: () => import('../views/meal/MealInputView.vue')
        },
        {
            // 식사 현황 조회 화면 - VIEWER 전용
            // 로그인 후 VIEWER 역할일 때 이동하는 화면이에요.
            // 경리담당자가 자기 회사 데이터만 조회할 수 있어요.
            path: '/meal-view',
            name: 'meal-view',
            component: () => import('../views/meal/MealView.vue')
        }
    ]
})

export default router