<template>
  <div class="meal-input-container">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-left">
        <button class="btn-home" @click="$router.push('/dashboard')">🏠 홈</button>
        <h2>🍱 일일 식사 입력</h2>
      </div>
    </div>

    <div class="form-card">

      <!-- 날짜 선택 -->
      <div class="form-row">
        <label>날짜 *</label>
        <input type="date" v-model="form.recordDate" />
      </div>

      <!-- 회사 선택 -->
      <div class="form-row">
        <label>회사 *</label>
        <select v-model="form.companyId" @change="onCompanyChange">
          <option value="">회사를 선택하세요</option>
          <option v-for="company in companies" :key="company.id" :value="company.id">
            {{ company.companyName }}
          </option>
        </select>
      </div>

      <!-- 팀 선택 -->
      <div class="form-row">
        <label>팀 *</label>
        <select v-model="form.companyTeamId" @change="onTeamChange" :disabled="!form.companyId">
          <option value="">팀을 선택하세요</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">
            {{ team.teamName }}
          </option>
        </select>
      </div>

      <!-- 중식 인원 -->
      <div class="form-row">
        <label>중식 인원</label>
        <div class="input-with-unit">
          <input
              type="number"
              v-model="form.lunchCount"
              @input="calculate"
              placeholder="0"
              min="0"
          />
          <span class="unit">명</span>
        </div>
      </div>

      <!-- 석식 인원 -->
      <div class="form-row">
        <label>석식 인원</label>
        <div class="input-with-unit">
          <input
              type="number"
              v-model="form.dinnerCount"
              @input="calculate"
              placeholder="0"
              min="0"
          />
          <span class="unit">명</span>
        </div>
      </div>

      <!-- 계산 결과 -->
      <div class="calc-section" v-if="selectedTeam">
        <div class="calc-row">
          <span class="calc-label">중식 단가</span>
          <span class="calc-value">{{ selectedTeam.lunchPrice?.toLocaleString() }}원</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">석식 단가</span>
          <span class="calc-value">{{ selectedTeam.dinnerPrice?.toLocaleString() }}원</span>
        </div>
        <div class="calc-divider"></div>
        <div class="calc-row">
          <span class="calc-label">중식 금액</span>
          <span class="calc-value">{{ lunchAmount.toLocaleString() }}원</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">석식 금액</span>
          <span class="calc-value">{{ dinnerAmount.toLocaleString() }}원</span>
        </div>
        <div class="calc-row total">
          <span class="calc-label">합계</span>
          <span class="calc-value">{{ totalAmount.toLocaleString() }}원</span>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <button class="btn-save" @click="saveMealRecord">저장</button>

    </div>
  </div>
</template>

<script>
import api from '../../api/axios'

export default {
  name: 'MealInputView',
  data() {
    return {
      // 회사 목록
      companies: [],
      // 팀 목록 (회사 선택 후 불러와요)
      teams: [],
      // 선택된 팀 (단가 계산용)
      selectedTeam: null,

      // 입력 폼
      form: {
        recordDate: new Date().toISOString().slice(0, 10), // 오늘 날짜 기본값
        companyId: '',
        companyTeamId: '',
        lunchCount: 0,
        dinnerCount: 0
      }
    }
  },

  computed: {
    // 중식 금액 = 중식 단가 × 중식 인원
    lunchAmount() {
      if (!this.selectedTeam) return 0
      return (this.selectedTeam.lunchPrice || 0) * (this.form.lunchCount || 0)
    },

    // 석식 금액 = 석식 단가 × 석식 인원
    dinnerAmount() {
      if (!this.selectedTeam) return 0
      return (this.selectedTeam.dinnerPrice || 0) * (this.form.dinnerCount || 0)
    },

    // 합계 = 중식 금액 + 석식 금액
    totalAmount() {
      return this.lunchAmount + this.dinnerAmount
    }
  },

  mounted() {
    // 화면 진입 시 회사 목록 불러오기
    this.loadCompanies()
  },

  methods: {
    /**
     * 회사 목록 조회
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
     * 회사 선택 시 팀 목록 불러오기
     * 회사가 바뀌면 팀 선택과 계산 결과도 초기화해요.
     */
    async onCompanyChange() {
      this.form.companyTeamId = ''
      this.selectedTeam = null
      this.teams = []

      if (!this.form.companyId) return

      try {
        const response = await api.get(`/api/companies/${this.form.companyId}/teams`)
        this.teams = response.data
      } catch (error) {
        alert('팀 목록을 불러오는데 실패했습니다.')
      }
    },

    /**
     * 팀 선택 시 단가 정보 설정
     * 선택된 팀의 단가를 가져와서 자동 계산에 사용해요.
     */
    onTeamChange() {
      this.selectedTeam = this.teams.find(
          team => team.id === this.form.companyTeamId
      ) || null
    },

    /**
     * 금액 계산
     * computed로 자동 계산되므로 별도 로직 불필요해요.
     */
    calculate() {},

    /**
     * 식사 기록 저장
     * 유효성 검사 후 API로 저장해요.
     */
    async saveMealRecord() {
      if (!this.form.recordDate) {
        alert('날짜를 선택해주세요.')
        return
      }
      if (!this.form.companyId) {
        alert('회사를 선택해주세요.')
        return
      }
      if (!this.form.companyTeamId) {
        alert('팀을 선택해주세요.')
        return
      }
      if (!this.form.lunchCount && !this.form.dinnerCount) {
        alert('중식 또는 석식 인원을 입력해주세요.')
        return
      }

      try {
        // POST /zzzzapi/meal-records
        await api.post('/api/meal-records', {
          recordDate: this.form.recordDate,
          companyId: this.form.companyId,
          companyTeamId: this.form.companyTeamId,
          lunchCount: this.form.lunchCount || 0,
          dinnerCount: this.form.dinnerCount || 0
        })

        alert('식사 기록이 저장되었습니다!')

        // 저장 후 폼 초기화
        this.form.companyId = ''
        this.form.companyTeamId = ''
        this.form.lunchCount = 0
        this.form.dinnerCount = 0
        this.selectedTeam = null
        this.teams = []

      } catch (error) {
        alert('저장에 실패했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.meal-input-container {
  padding: 30px;
  max-width: 600px;
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

.form-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  padding: 30px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.form-row label {
  width: 100px;
  font-size: 14px;
  color: #555;
  flex-shrink: 0;
}

.form-row input[type="date"],
.form-row select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-row input[type="date"]:focus,
.form-row select:focus {
  outline: none;
  border-color: #4a90e2;
}

.form-row select:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.input-with-unit {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.input-with-unit input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  text-align: right;
}

.input-with-unit input:focus {
  outline: none;
  border-color: #4a90e2;
}

.unit {
  font-size: 14px;
  color: #555;
}

.calc-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: #555;
}

.calc-row.total {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.calc-divider {
  border-top: 1px solid #ddd;
  margin: 10px 0;
}

.calc-label { color: #777; }
.calc-value { color: #333; }

.btn-save {
  width: 100%;
  padding: 14px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.btn-save:hover { background: #357abd; }
</style>