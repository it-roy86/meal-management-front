import axios from 'axios'

// axios 기본 설정
// 모든 API 요청에 공통으로 적용되는 설정이에요.
const instance = axios.create({
    // Spring Boot 서버 주소
    baseURL: 'http://localhost:8080',
    // 요청 제한 시간 (5초)
    timeout: 5000
})

// 요청 인터셉터
// 모든 API 요청을 보내기 전에 실행돼요.
// localStorage에 토큰이 있으면 자동으로 헤더에 붙여줘요.
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            // "Bearer 토큰값" 형식으로 헤더에 추가해요
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 응답 인터셉터
// 모든 API 응답을 받은 후에 실행돼요.
// 401(인증 오류)이 오면 자동으로 로그인 화면으로 이동해요.
instance.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // 토큰이 만료됐거나 없으면 로그인 화면으로 이동
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default instance