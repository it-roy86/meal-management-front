import axios from 'axios'

/**
 * axios 공통 설정
 * baseURL을 비워두면 현재 도메인 기준으로 요청해요.
 * 로컬: Vite가 /api/* → localhost:8080 으로 프록시
 * 서버: Nginx가 /api/* → backend:8080 으로 프록시
 */
const api = axios.create({
    baseURL: ''
})

// JWT 토큰 자동 추가
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 401 응답 시 로그인 화면으로 이동
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('username')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default api