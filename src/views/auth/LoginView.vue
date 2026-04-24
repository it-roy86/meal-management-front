<template>
  <div class="login-container">
    <div class="login-box">
      <h2>구내식당 관리 시스템</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>아이디</label>
          <input
              v-model="username"
              type="text"
              placeholder="아이디를 입력하세요"
              required
          />
        </div>
        <div class="form-group">
          <label>비밀번호</label>
          <input
              v-model="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
          />
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <!-- 수정된 버튼 (로딩 중 비활성화) -->
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../../api/axios.js' // 방금 만든 axios 인스턴스 사용

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      isLoading: false // 로그인 중 버튼 비활성화용
    }
  },
  methods: {
    async handleLogin() {
      // 로딩 시작
      this.isLoading = true
      this.errorMessage = ''

      try {
        // Spring Boot 로그인 API 호출
        const response = await api.post('/api/auth/login', {
          username: this.username,
          password: this.password
        })

        const { token, role, username } = response.data

        // JWT 토큰과 역할을 브라우저에 저장
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
        localStorage.setItem('username', username)

        // 역할별 화면 이동
        if (role === 'ADMIN') {
          this.$router.push('/dashboard')
        } else if (role === 'OPERATOR') {
          this.$router.push('/meal-input')
        } else if (role === 'VIEWER') {
          this.$router.push('/meal-view')
        }

      } catch (error) {
        // 로그인 실패 시 에러 메시지 표시
        if (error.response && error.response.status === 401) {
          this.errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.'
        } else {
          this.errorMessage = '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
        }
      } finally {
        // 로딩 종료
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 360px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #555;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #357abd;
}

.error {
  color: red;
  font-size: 13px;
  margin-bottom: 10px;
  text-align: center;
}
</style>