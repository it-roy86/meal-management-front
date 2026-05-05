<template>
  <div class="meal-view-container">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-left">
        <button class="btn-home" @click="$router.push('/dashboard')">🏠 홈</button>
        <h2>📋 식사 현황 조회</h2>
      </div>
    </div>

    <!-- 검색 조건 -->
    <div class="search-card">
      <div class="search-row">

        <!-- 시작일 -->
        <div class="search-item">
          <label>시작일</label>
          <input type="date" v-model="search.startDate" />
        </div>

        <!-- 종료일 -->
        <div class="search-item">
          <label>종료일</label>
          <input type="date" v-model="search.endDate" />
        </div>

        <!-- 회사 선택 (ADMIN만 보임) -->
        <div class="search-item" v-if="role === 'ADMIN'">
          <label>회사</label>
          <select v-model="search.companyId">
            <option value="">전체</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.companyName }}
            </option>
          </select>
        </div>

        <button class="btn-search" @click="loadMealRecords">조회</button>
      </div>
    </div>

    <!-- 조회 결과 테이블 -->
    <div class="result-card">
      <div class="result-header">
        <h3>조회 결과</h3>
        <span class="total-badge">총 {{ mealRecords.length }}건</span>
      </div>

      <table class="table">
        <thead>
        <tr>
          <th>날짜</th>
          <th>회사명</th>
          <th>팀명</th>
          <th>중식 인원</th>
          <th>석식 인원</th>
          <th>총 인원</th>
          <th>합계 금액</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="record in mealRecords" :key="record.id">
          <td>{{ record.recordDate }}</td>
          <td>{{ record.companyName }}</td>
          <td>{{ record.teamName }}</td>
          <td>{{ record.lunchCount }}명</td>
          <td>{{ record.dinnerCount }}명</td>
          <td>{{ record.totalCount }}명</td>
          <td>{{ record.totalAmount?.toLocaleString() }}원</td>
        </tr>
        <tr v-if="mealRecords.length === 0">
          <td colspan="7" class="empty">조회된 데이터가 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <!-- 모바일 카드 목록 -->
      <div class="mobile-list">
        <div class="mobile-record-card" v-for="record in mealRecords" :key="record.id">
          <div class="mobile-record-header">
            <span class="mobile-record-date">{{ record.recordDate }}</span>
            <span class="mobile-record-amount">{{ record.totalAmount?.toLocaleString() }}원</span>
          </div>
          <div class="mobile-record-body">
            <span class="mobile-record-company">🏢 {{ record.companyName }}</span>
            <span class="mobile-record-team">👥 {{ record.teamName }}</span>
          </div>
          <div class="mobile-record-footer">
            <span>중식 {{ record.lunchCount }}명</span>
            <span>석식 {{ record.dinnerCount }}명</span>
            <span>총 {{ record.totalCount }}명</span>
          </div>
        </div>
        <div v-if="mealRecords.length === 0" class="empty">조회된 데이터가 없습니다.</div>
      </div>

      <!-- 합계 -->
      <div class="summary" v-if="mealRecords.length > 0">
        <span>총 중식: {{ totalLunchCount }}명</span>
        <span>총 석식: {{ totalDinnerCount }}명</span>
        <span class="total-amount">총 금액: {{ totalAmount.toLocaleString() }}원</span>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../../api/axios'

export default {
  name: 'MealView',
  data() {
    return {
      // 현재 로그인한 역할
      role: localStorage.getItem('role'),

      // 검색 조건
      search: {
        // 이번 달 1일부터 오늘까지 기본값
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        companyId: ''
      },

      // 회사 목록 (ADMIN용)
      companies: [],

      // 식사 기록 목록
      mealRecords: []
    }
  },

  computed: {
    // 총 중식 인원
    totalLunchCount() {
      return this.mealRecords.reduce((sum, r) => sum + (r.lunchCount || 0), 0)
    },
    // 총 석식 인원
    totalDinnerCount() {
      return this.mealRecords.reduce((sum, r) => sum + (r.dinnerCount || 0), 0)
    },
    // 총 금액
    totalAmount() {
      return this.mealRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
    }
  },

  async mounted() {
    // ADMIN이면 회사 목록 불러오기
    if (this.role === 'ADMIN') {
      await this.loadCompanies()
    }
    // 화면 진입 시 이번 달 데이터 바로 조회
    await this.loadMealRecords()
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
     * 식사 기록 조회
     * 날짜 범위 + 회사 조건으로 조회해요.
     */
    async loadMealRecords() {
      try {
        const params = {
          startDate: this.search.startDate,
          endDate: this.search.endDate
        }

        // ADMIN이고 회사를 선택했으면 회사 ID 추가
        if (this.role === 'ADMIN' && this.search.companyId) {
          params.companyId = this.search.companyId
        }

        const response = await api.get('/api/meal-records', { params })
        this.mealRecords = response.data
      } catch (error) {
        alert('식사 기록을 불러오는데 실패했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.meal-view-container {
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

.search-item input:focus,
.search-item select:focus {
  outline: none;
  border-color: #4a90e2;
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

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.result-header h3 {
  font-size: 16px;
  color: #333;
}

.total-badge {
  background: #e8f4fd;
  color: #4a90e2;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 13px;
}

.table {
  width: 100%;
  border-collapse: collapse;
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

.empty {
  text-align: center;
  color: #999;
  padding: 30px !important;
}

.summary {
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  padding: 16px 12px 0;
  font-size: 14px;
  color: #555;
  border-top: 2px solid #eee;
  margin-top: 8px;
}

.total-amount {
  font-weight: bold;
  color: #333;
  font-size: 15px;
}

/* PC 화면에서 모바일 카드 숨기기 */
.mobile-list {
  display: none;
}

/* 모바일 화면 대응 (768px 이하) */
@media (max-width: 768px) {

  .meal-view-container {
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

  /* 테이블 숨기기 */
  .table {
    display: none;
  }

  /* 모바일 카드 목록 보이기 */
  .mobile-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mobile-record-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* 날짜 + 금액 */
  .mobile-record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mobile-record-date {
    font-size: 13px;
    color: #888;
  }

  .mobile-record-amount {
    font-size: 15px;
    font-weight: bold;
    color: #4a90e2;
  }

  /* 회사명 + 팀명 */
  .mobile-record-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mobile-record-company {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }

  .mobile-record-team {
    font-size: 13px;
    color: #555;
  }

  /* 인원 정보 */
  .mobile-record-footer {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #888;
    border-top: 1px solid #eee;
    padding-top: 8px;
  }

  /* 합계 세로 정렬 */
  .summary {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
}
</style>