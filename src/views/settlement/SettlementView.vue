<template>
  <div class="settlement-container">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-left">
        <button class="btn-home" @click="$router.push('/dashboard')">🏠 홈</button>
        <h2>💰 월별 정산</h2>
      </div>
    </div>

    <!-- 검색 조건 -->
    <div class="search-card">
      <div class="search-row">

        <!-- 년월 선택 -->
        <div class="search-item">
          <label>년월</label>
          <input type="month" v-model="search.yearMonth" />
        </div>

        <!-- 회사 선택 (ADMIN만) -->
        <div class="search-item" v-if="role === 'ADMIN'">
          <label>회사</label>
          <select v-model="search.companyId">
            <option value="">전체</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.companyName }}
            </option>
          </select>
        </div>

        <button class="btn-search" @click="loadSettlement">조회</button>
      </div>
    </div>

    <!-- 정산 결과 -->
    <div class="result-card" v-if="settlements.length > 0">

      <!-- 회사별 정산 -->
      <div
          class="company-section"
          v-for="settlement in settlements"
          :key="settlement.companyId"
      >
        <div class="company-header">
          <h3>🏢 {{ settlement.companyName }}</h3>
          <span class="total-badge">
            총 {{ settlement.totalAmount.toLocaleString() }}원
          </span>
        </div>

        <table class="table">
          <thead>
          <tr>
            <th>팀명</th>
            <th>중식 인원</th>
            <th>중식 금액</th>
            <th>석식 인원</th>
            <th>석식 금액</th>
            <th>합계 금액</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="team in settlement.teams" :key="team.teamName">
            <td>{{ team.teamName }}</td>
            <td>{{ team.lunchCount }}명</td>
            <td>{{ team.lunchAmount.toLocaleString() }}원</td>
            <td>{{ team.dinnerCount }}명</td>
            <td>{{ team.dinnerAmount.toLocaleString() }}원</td>
            <td class="amount">{{ team.totalAmount.toLocaleString() }}원</td>
          </tr>
          </tbody>
          <tfoot>
          <tr class="summary-row">
            <td>합계</td>
            <td>{{ settlement.totalLunchCount }}명</td>
            <td>{{ settlement.totalLunchAmount.toLocaleString() }}원</td>
            <td>{{ settlement.totalDinnerCount }}명</td>
            <td>{{ settlement.totalDinnerAmount.toLocaleString() }}원</td>
            <td class="amount">{{ settlement.totalAmount.toLocaleString() }}원</td>
          </tr>
          </tfoot>
        </table>
        <!-- 모바일 카드 목록 (팀별 정산) -->
        <div class="mobile-list">
          <div
              class="mobile-team-card"
              v-for="team in settlement.teams"
              :key="team.teamName"
          >
            <div class="mobile-team-header">
              <span class="mobile-team-name">{{ team.teamName }}</span>
              <span class="mobile-team-total">{{ team.totalAmount.toLocaleString() }}원</span>
            </div>
            <div class="mobile-team-row">
              <div class="mobile-team-item">
                <span class="mobile-team-label">중식</span>
                <span class="mobile-team-value">{{ team.lunchCount }}명</span>
                <span class="mobile-team-amount">{{ team.lunchAmount.toLocaleString() }}원</span>
              </div>
              <div class="mobile-team-divider"></div>
              <div class="mobile-team-item">
                <span class="mobile-team-label">석식</span>
                <span class="mobile-team-value">{{ team.dinnerCount }}명</span>
                <span class="mobile-team-amount">{{ team.dinnerAmount.toLocaleString() }}원</span>
              </div>
            </div>
          </div>

          <!-- 합계 카드 -->
          <div class="mobile-summary-card">
            <div class="mobile-team-header">
              <span class="mobile-team-name">합계</span>
              <span class="mobile-team-total">{{ settlement.totalAmount.toLocaleString() }}원</span>
            </div>
            <div class="mobile-team-row">
              <div class="mobile-team-item">
                <span class="mobile-team-label">중식</span>
                <span class="mobile-team-value">{{ settlement.totalLunchCount }}명</span>
                <span class="mobile-team-amount">{{ settlement.totalLunchAmount.toLocaleString() }}원</span>
              </div>
              <div class="mobile-team-divider"></div>
              <div class="mobile-team-item">
                <span class="mobile-team-label">석식</span>
                <span class="mobile-team-value">{{ settlement.totalDinnerCount }}명</span>
                <span class="mobile-team-amount">{{ settlement.totalDinnerAmount.toLocaleString() }}원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 전체 합계 -->
      <div class="grand-total">
        <span>전체 합계</span>
        <span class="grand-amount">{{ grandTotal.toLocaleString() }}원</span>
      </div>
    </div>

    <!-- 데이터 없음 -->
    <div class="result-card" v-else>
      <p class="empty">조회된 데이터가 없습니다.</p>
    </div>

  </div>
</template>

<script>
import api from '../../api/axios'

export default {
  name: 'SettlementView',
  data() {
    return {
      // 현재 로그인한 역할
      role: localStorage.getItem('role'),

      // 검색 조건 (이번 달 기본값)
      search: {
        yearMonth: new Date().toISOString().slice(0, 7), // yyyy-MM 형식
        companyId: ''
      },

      // 회사 목록 (ADMIN용)
      companies: [],

      // 정산 결과 목록
      settlements: []
    }
  },

  computed: {
    // 전체 합계 금액
    grandTotal() {
      return this.settlements.reduce((sum, s) => sum + s.totalAmount, 0)
    }
  },

  async mounted() {
    if (this.role === 'ADMIN') {
      await this.loadCompanies()
    }
    await this.loadSettlement()
  },

  methods: {
    /**
     * 회사 목록 조회 (ADMIN용)
     */
    async loadCompanies() {
      try {
        const response = await api.get('/api/companies')
        this.companies = response.data
      } catch (error) {
        alert('회사 목록을 불러오는데 실패했습니다.')
      }
    },

    /**
     * 월별 정산 데이터 조회
     * 선택한 년월의 식사 기록을 회사/팀별로 집계해요.
     */
    async loadSettlement() {
      try {
        const params = {
          yearMonth: this.search.yearMonth
        }

        if (this.role === 'ADMIN' && this.search.companyId) {
          params.companyId = this.search.companyId
        }

        const response = await api.get('/api/settlement', { params })
        this.settlements = response.data
      } catch (error) {
        alert('정산 데이터를 불러오는데 실패했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.settlement-container {
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  font-size: 24px;
  color: #333;
}

.btn-home {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-home:hover { background: #e0e0e0; }

.search-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  padding: 20px 24px;
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-item label {
  font-size: 13px;
  color: #555;
}

.search-item input,
.search-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.btn-search {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 9px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  height: 38px;
}

.btn-search:hover { background: #357abd; }

.result-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  padding: 24px;
}

.company-section {
  margin-bottom: 30px;
}

.company-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.company-header h3 {
  font-size: 18px;
  color: #333;
}

.total-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-size: 14px;
  color: #555;
  border-bottom: 2px solid #eee;
}

.table td {
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.summary-row {
  background: #f8f9fa;
  font-weight: bold;
}

.summary-row td {
  border-top: 2px solid #ddd;
}

.amount {
  font-weight: bold;
  color: #4a90e2;
}

.grand-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding: 16px 12px;
  border-top: 2px solid #eee;
  margin-top: 8px;
  font-size: 16px;
  color: #555;
}

.grand-amount {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.empty {
  text-align: center;
  color: #999;
  padding: 30px;
}

/* PC 화면에서 모바일 카드 숨기기 */
.mobile-list {
  display: none;
}

/* 모바일 화면 대응 (768px 이하) */
@media (max-width: 768px) {

  .settlement-container {
    padding: 16px;
  }

  /* 검색 조건 세로 정렬 */
  .search-card {
    padding: 16px;
  }

  .search-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-item input,
  .search-item select {
    width: 100%;
  }

  .btn-search {
    width: 100%;
    height: 42px;
  }

  /* 결과 카드 */
  .result-card {
    padding: 16px;
  }

  /* 회사 헤더 */
  .company-header h3 {
    font-size: 16px;
  }

  /* 테이블 숨기기 */
  .table {
    display: none;
  }

  /* 모바일 카드 목록 보이기 */
  .mobile-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  /* 팀 카드 */
  .mobile-team-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* 합계 카드 */
  .mobile-summary-card {
    background: #e8f4fd;
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-weight: bold;
  }

  /* 팀명 + 합계 금액 */
  .mobile-team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mobile-team-name {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }

  .mobile-team-total {
    font-size: 15px;
    font-weight: bold;
    color: #4a90e2;
  }

  /* 중식/석식 행 */
  .mobile-team-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-team-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    gap: 2px;
  }

  .mobile-team-label {
    font-size: 11px;
    color: #888;
  }

  .mobile-team-value {
    font-size: 14px;
    color: #333;
  }

  .mobile-team-amount {
    font-size: 13px;
    color: #555;
  }

  .mobile-team-divider {
    width: 1px;
    height: 40px;
    background: #ddd;
  }

  /* 전체 합계 */
  .grand-total {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .grand-amount {
    font-size: 18px;
  }
}
</style>