// vue-router나 DOM에 의존하지 않는 순수 로직만 따로 뒀어요.
// router/index.js가 이 파일을 가져다 쓰고, 테스트도 이 파일을 직접 테스트해요
// (jsdom 없이도 테스트가 빠르게 돌아가도록).

// 로그인 성공 시 role별로 이동시키는 기본 화면
// LoginView.vue의 분기 로직과 동일하게 맞춰뒀어요 (역할별 화면 접근 거부 시 되돌아갈 곳으로도 사용).
export const HOME_BY_ROLE = {
    ADMIN: '/dashboard',
    OPERATOR: '/meal-input',
    VIEWER: '/meal-view'
}

/**
 * 네비게이션 가드 판정 로직 (순수 함수)
 * - 로그인 화면(meta.public)은 그대로 통과
 * - role이 없으면(로그인 안 함) 로그인 화면으로 되돌림
 * - role은 있지만 현재 화면의 허용 role이 아니면 자기 role의 기본 화면으로 되돌림
 *
 * JWT는 httpOnly 쿠키로 관리돼서 JS로는 존재 여부를 알 수 없어요.
 * 그래서 로그인 여부는 로그인 성공 시 함께 저장해두는 localStorage의
 * role 값으로 판단해요. 쿠키가 실제로 만료/위조됐는지는 어차피 이 값과
 * 상관없이 API 호출 시 백엔드가 401로 걸러내고, axios 인터셉터가 그때
 * 로그인 화면으로 돌려보내요 (src/api/axios.js 참고).
 *
 * @param {{public?: boolean, roles?: string[]}} meta 이동하려는 라우트의 meta
 * @param {string|null} role localStorage에 저장된 현재 role
 * @returns {true|string} true면 이동 허용, 문자열이면 그 경로로 리다이렉트
 */
export function resolveRouteGuard(meta, role) {
    if (meta.public) {
        return true
    }

    if (!role) {
        return '/'
    }

    const allowedRoles = meta.roles
    if (allowedRoles && !allowedRoles.includes(role)) {
        return HOME_BY_ROLE[role] ?? '/'
    }

    return true
}
