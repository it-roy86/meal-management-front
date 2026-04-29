<template>
  <div class="dashboard-container">
    <div class="header">
      <h2>🏠 대시보드 (ADMIN)</h2>
      <button class="btn-logout" @click="logout">로그아웃</button>
    </div>

    <div class="menu-grid">
      <div class="menu-card" @click="$router.push('/setting')">
        <div class="menu-icon">⚙️</div>
        <div class="menu-title">설정 관리</div>
        <div class="menu-desc">회사/팀 등록 및 단가 설정</div>
      </div>
      <div class="menu-card" @click="$router.push('/meal-input')">
        <div class="menu-icon">🍱</div>
        <div class="menu-title">식사 입력</div>
        <div class="menu-desc">일일 식사 인원 입력</div>
      </div>
      <div class="menu-card" @click="$router.push('/meal-view')">
        <div class="menu-icon">📋</div>
        <div class="menu-title">현황 조회</div>
        <div class="menu-desc">식사 현황 조회</div>
      </div>
      <!-- 기존 메뉴 카드 아래에 추가 -->
      <div class="menu-card" @click="$router.push('/settlement')">
        <div class="menu-icon">💰</div>
        <div class="menu-title">월별 정산</div>
        <div class="menu-desc">월별 식사 비용 정산</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  methods: {
    /**
     * 로그아웃 메서드
     * 브라우저 localStorage에 저장된 JWT 토큰과 사용자 정보를 삭제하고
     * 로그인 화면으로 이동해요.
     * localStorage를 지우지 않으면 새로고침해도 로그인 상태가 유지돼요.
     */
    logout() {
      // JWT 토큰 삭제 (이게 없으면 API 요청 시 인증 실패)
      localStorage.removeItem('token')
      // 역할 정보 삭제 (ADMIN/OPERATOR/VIEWER)
      localStorage.removeItem('role')
      // 사용자명 삭제
      localStorage.removeItem('username')

      // 로그인 화면으로 이동
      // this.$router는 Vue Router 인스턴스예요.
      // push()는 페이지를 이동하는 메서드예요.
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  color: #333;
}

.btn-logout {
  background: #ff5252;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-logout:hover { background: #d32f2f; }

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.menu-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}

.menu-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.menu-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.menu-desc {
  font-size: 13px;
  color: #888;
}
</style>