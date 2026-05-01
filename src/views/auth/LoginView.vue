<template>
  <div class="login-container">
    <div class="login-box">
      <h2>구내식당 관리 시스템</h2>

      <!-- 로그인 탭 -->
      <div class="tab-group">
        <button
            :class="['tab-btn', activeTab === 'admin' ? 'active' : '']"
            @click="activeTab = 'admin'; errorMessage = ''"
        >
          관리자 / 운영자
        </button>
        <button
            :class="['tab-btn', activeTab === 'viewer' ? 'active' : '']"
            @click="activeTab = 'viewer'; errorMessage = ''"
        >
          경리담당자
        </button>
      </div>

      <!-- 관리자 / 운영자 로그인 -->
      <form v-if="activeTab === 'admin'" @submit.prevent="handleLogin">
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
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <!-- 경리담당자 로그인 -->
      <form v-if="activeTab === 'viewer'" @submit.prevent="handleViewerLogin">
        <div class="form-group">
          <label>회사 선택</label>
          <select v-model="viewerForm.companyId" required>
            <option value="">회사를 선택하세요</option>
            <option
                v-for="company in companies"
                :key="company.id"
                :value="company.id"
            >
              {{ company.companyName }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>사업자번호 뒤 4자리</label>
          <input
              v-model="viewerForm.businessNumberLast4"
              type="password"
              placeholder="사업자번호 뒤 4자리를 입력하세요"
              maxlength="4"
              required
          />
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script>
import api from '../../api/axios'

export default {
  name: 'LoginView',
  data() {
    return {
      // 활성 탭 (admin / viewer)
      activeTab: 'admin',

      // 관리자/운영자 로그인 폼
      username: '',
      password: '',

      // 경리담당자 로그인 폼
      viewerForm: {
        companyId: '',
        businessNumberLast4: ''
      },

      // 회사 목록 (경리담당자 탭용)
      companies: [],

      errorMessage: '',
      isLoading: false
    }
  },

  async mounted() {
    // 회사 목록 미리 불러오기 (경리담당자 탭 회사 선택용)
    await this.loadCompanies()
  },

  methods: {
    /**
     * 회사 목록 조회 (로그인 없이 접근 가능한 공개 API)
     * 경리담당자 로그인 시 회사 선택 드롭다운에 사용해요.
     */
    async loadCompanies() {
      try {
        const response = await api.get('/api/companies/public')
        this.companies = response.data
      } catch (error) {
        console.error('회사 목록 조회 실패')
      }
    },

    /**
     * 관리자/운영자 로그인
     * 아이디 + 비밀번호로 JWT 토큰을 발급받아요.
     * ADMIN → 대시보드, OPERATOR → 식사 입력 화면으로 이동해요.
     */
    async handleLogin() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const response = await api.post('/api/auth/login', {
          username: this.username,
          password: this.password
        })
        const { token, role, username } = response.data

        // JWT 토큰과 사용자 정보 저장
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
        localStorage.setItem('username', username)

        // 역할별 화면 이동
        if (role === 'ADMIN') this.$router.push('/dashboard')
        else if (role === 'OPERATOR') this.$router.push('/meal-input')

      } catch (error) {
        this.errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 경리담당자 로그인
     * 회사 선택 + 사업자번호 뒤 4자리로 인증해요.
     * 별도 계정 없이 회사 정보만으로 로그인 가능해요.
     * 로그인 성공 시 식사 현황 조회 화면으로 이동해요.
     */
    async handleViewerLogin() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const response = await api.post('/api/auth/viewer-login', {
          companyId: this.viewerForm.companyId,
          businessNumberLast4: this.viewerForm.businessNumberLast4
        })
        const { token, role, username } = response.data

        // JWT 토큰과 사용자 정보 저장
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
        localStorage.setItem('username', username)

        // 식사 현황 조회 화면으로 이동
        this.$router.push('/meal-view')

      } catch (error) {
        this.errorMessage = '사업자번호가 올바르지 않습니다.'
      } finally {
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
  width: 380px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 20px;
}

/* 탭 스타일 */
.tab-group {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 2px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
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

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #4a90e2;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
}

button[type="submit"]:hover {
  background-color: #357abd;
}

button[type="submit"]:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.error {
  color: red;
  font-size: 13px;
  margin-bottom: 10px;
  text-align: center;
}
</style>