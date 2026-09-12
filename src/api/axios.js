import axios from 'axios'

/**
 * axios 공통 설정
 * baseURL을 비워두면 현재 도메인 기준으로 요청해요.
 * 로컬: Vite가 /api/* → localhost:8080 으로 프록시
 * 서버: Nginx가 /api/* → backend:8080 으로 프록시
 *
 * JWT는 httpOnly 쿠키로 관리해요 (localStorage에 안 남아요).
 * withCredentials: true로 설정해야 브라우저가 쿠키를 요청에 실어 보내요.
 */
const api = axios.create({
    baseURL: '',
    withCredentials: true
})

// 401 응답 시 로그인 화면으로 이동
// (쿠키는 httpOnly라 여기서 직접 지울 수 없고, 서버가 만료 응답을 준 것뿐이라
//  화면 전환용 role/username만 정리해요. 쿠키 자체는 /api/auth/logout이 지워요.)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('role')
            localStorage.removeItem('username')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default api