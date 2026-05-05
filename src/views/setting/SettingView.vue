<template>
  <div class="setting-container">

    <!-- 상단 헤더 -->
    <div class="header">
      <div class="header-left">
        <button class="btn-home" @click="$router.push('/dashboard')">🏠 홈</button>
        <h2>⚙️ 설정 관리</h2>
      </div>
    </div>

    <!-- 회사 목록 섹션 -->
    <div class="section">
      <div class="section-header">
        <h3>🏢 회사 목록</h3>
        <button class="btn-add" @click="openCompanyModal(null)">+ 회사 추가</button>
      </div>

      <!-- PC 테이블 -->
      <table class="table">
        <thead>
        <tr>
          <th>회사명</th>
          <th>사업자번호</th>
          <th>담당자 이메일</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="company in companies" :key="company.id">
          <td>{{ company.companyName }}</td>
          <td>{{ company.businessNumber || '-' }}</td>
          <td>{{ company.contactEmail || '-' }}</td>
          <td>
              <span :class="company.isActive ? 'badge-active' : 'badge-inactive'">
                {{ company.isActive ? '활성' : '비활성' }}
              </span>
          </td>
          <td>
            <button class="btn-edit" @click="openCompanyModal(company)">수정</button>
            <button class="btn-team" @click="selectCompany(company)">팀 관리</button>
          </td>
        </tr>
        <tr v-if="companies.length === 0">
          <td colspan="5" class="empty">등록된 회사가 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <!-- 모바일 카드 목록 (회사) -->
      <div class="mobile-list">
        <div class="mobile-card" v-for="company in companies" :key="company.id">
          <div class="mobile-card-info">
            <span class="mobile-card-name">{{ company.companyName }}</span>
            <span class="mobile-card-sub">{{ company.businessNumber || '사업자번호 없음' }}</span>
            <span class="mobile-card-sub">{{ company.contactEmail || '이메일 없음' }}</span>
            <span class="mobile-card-sub">
              <span :class="company.isActive ? 'badge-active' : 'badge-inactive'">
                {{ company.isActive ? '활성' : '비활성' }}
              </span>
            </span>
          </div>
          <div class="mobile-card-buttons">
            <button class="btn-edit" @click="openCompanyModal(company)">수정</button>
            <button class="btn-team" @click="selectCompany(company)">팀</button>
          </div>
        </div>
        <div v-if="companies.length === 0" class="empty">등록된 회사가 없습니다.</div>
      </div>
    </div>  <!-- ← 회사 섹션 닫기 -->

    <!-- 팀 목록 섹션 -->
    <div class="section" v-if="selectedCompany">
      <div class="section-header">
        <h3>👥 {{ selectedCompany.companyName }} 팀 목록</h3>
        <button class="btn-add" @click="openTeamModal(null)">+ 팀 추가</button>
      </div>

      <!-- PC 테이블 -->
      <table class="table">
        <thead>
        <tr>
          <th>팀명</th>
          <th>중식 단가</th>
          <th>석식 단가</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="team in teams" :key="team.id">
          <td>{{ team.teamName }}</td>
          <td>{{ team.lunchPrice != null ? team.lunchPrice.toLocaleString() : '-' }}원</td>
          <td>{{ team.dinnerPrice != null ? team.dinnerPrice.toLocaleString() : '-' }}원</td>
          <td>
              <span :class="team.isActive ? 'badge-active' : 'badge-inactive'">
                {{ team.isActive ? '활성' : '비활성' }}
              </span>
          </td>
          <td>
            <button class="btn-edit" @click="openTeamModal(team)">수정</button>
          </td>
        </tr>
        <tr v-if="teams.length === 0">
          <td colspan="5" class="empty">등록된 팀이 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <!-- 모바일 카드 목록 (팀) -->
      <div class="mobile-list">
        <div class="mobile-card" v-for="team in teams" :key="team.id">
          <div class="mobile-card-info">
            <span class="mobile-card-name">{{ team.teamName }}</span>
            <span class="mobile-card-sub">
              중식 {{ team.lunchPrice != null ? team.lunchPrice.toLocaleString() : '-' }}원
            </span>
            <span class="mobile-card-sub">
              석식 {{ team.dinnerPrice != null ? team.dinnerPrice.toLocaleString() : '-' }}원
            </span>
            <span class="mobile-card-sub">
              <span :class="team.isActive ? 'badge-active' : 'badge-inactive'">
                {{ team.isActive ? '활성' : '비활성' }}
              </span>
            </span>
          </div>
          <div class="mobile-card-buttons">
            <button class="btn-edit" @click="openTeamModal(team)">수정</button>
          </div>
        </div>
        <div v-if="teams.length === 0" class="empty">등록된 팀이 없습니다.</div>
      </div>
    </div>  <!-- ← 팀 섹션 닫기 -->

    <!-- 회사 등록/수정 모달 -->
    <div class="modal-overlay" v-if="showCompanyModal" @click.self="closeCompanyModal">
      <div class="modal">
        <h3>{{ editingCompany ? '회사 수정' : '회사 등록' }}</h3>
        <div class="form-group">
          <label>회사명 *</label>
          <input v-model="companyForm.companyName" placeholder="회사명을 입력하세요" />
        </div>
        <div class="form-group">
          <label>사업자번호</label>
          <input v-model="companyForm.businessNumber" placeholder="0000000000 (10자리)" maxlength="10" />
        </div>
        <div class="form-group">
          <label>담당자 이메일</label>
          <input v-model="companyForm.contactEmail" placeholder="example@email.com" type="email" />
        </div>
        <div class="modal-buttons">
          <button class="btn-cancel" @click="closeCompanyModal">취소</button>
          <button class="btn-save" @click="saveCompany">저장</button>
        </div>
      </div>
    </div>

    <!-- 팀 등록/수정 모달 -->
    <div class="modal-overlay" v-if="showTeamModal" @click.self="closeTeamModal">
      <div class="modal">
        <h3>{{ editingTeam ? '팀 수정' : '팀 등록' }}</h3>
        <div class="form-group">
          <label>팀명 *</label>
          <input v-model="teamForm.teamName" placeholder="팀명을 입력하세요" />
        </div>
        <div class="form-group">
          <label>중식 단가 *</label>
          <input v-model="teamForm.lunchPrice" placeholder="6500" type="number" />
        </div>
        <div class="form-group">
          <label>석식 단가 *</label>
          <input v-model="teamForm.dinnerPrice" placeholder="6500" type="number" />
        </div>
        <div class="modal-buttons">
          <button class="btn-cancel" @click="closeTeamModal">취소</button>
          <button class="btn-save" @click="saveTeam">저장</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../../api/axios' // axios 공통 설정 사용

export default {
  name: 'SettingView',
  data() {
    return {
      // 회사 목록
      companies: [],
      // 선택된 회사 (팀 목록 표시용)
      selectedCompany: null,
      // 팀 목록
      teams: [],

      // 회사 모달
      showCompanyModal: false,
      editingCompany: null,
      companyForm: {
        companyName: '',
        businessNumber: '',
        contactEmail: ''
      },

      // 팀 모달
      showTeamModal: false,
      editingTeam: null,
      teamForm: {
        teamName: '',
        lunchPrice: null,
        dinnerPrice: null
      }
    }
  },

  // 컴포넌트가 화면에 마운트될 때 자동으로 회사 목록을 불러와요
  mounted() {
    this.loadCompanies()
  },

  methods: {

    // ========================
    // 회사 관련 메서드
    // ========================

    /**
     * 회사 목록 조회
     * 서버에서 활성화된 회사 목록을 불러와요.
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
     * 회사 선택 → 팀 목록 표시
     * 회사를 클릭하면 해당 회사의 팀 목록을 불러와요.
     */
    async selectCompany(company) {
      this.selectedCompany = company
      await this.loadTeams(company.id)
    },

    /**
     * 회사 모달 열기
     * company가 null이면 등록 모달, 아니면 수정 모달이에요.
     */
    openCompanyModal(company) {
      this.editingCompany = company
      if (company) {
        // 수정 모달: 기존 데이터 채우기
        this.companyForm = {
          companyName: company.companyName,
          businessNumber: company.businessNumber || '',
          contactEmail: company.contactEmail || ''
        }
      } else {
        // 등록 모달: 빈 폼
        this.companyForm = { companyName: '', businessNumber: '', contactEmail: '' }
      }
      this.showCompanyModal = true
    },

    // 회사 모달 닫기
    closeCompanyModal() {
      this.showCompanyModal = false
      this.editingCompany = null
    },

    /**
     * 회사 저장 (등록 or 수정)
     * editingCompany가 있으면 수정, 없으면 등록이에요.
     */
    async saveCompany() {
      if (!this.companyForm.companyName) {
        alert('회사명을 입력해주세요.')
        return
      }
      try {
        if (this.editingCompany) {
          // 수정: PUT /api/companies/{id}
          await api.put(`/api/companies/${this.editingCompany.id}`, this.companyForm)
          alert('회사 정보가 수정되었습니다.')
        } else {
          // 등록: POST /api/companies
          await api.post('/api/companies', this.companyForm)
          alert('회사가 등록되었습니다.')
        }
        // 저장 후 목록 새로고침
        await this.loadCompanies()
        this.closeCompanyModal()
      } catch (error) {
        alert('저장에 실패했습니다.')
      }
    },

    // ========================
    // 팀 관련 메서드
    // ========================

    /**
     * 팀 목록 조회
     * 선택된 회사의 팀 목록을 불러와요.
     */
    async loadTeams(companyId) {
      try {
        const response = await api.get(`/api/companies/${companyId}/teams`)
        this.teams = response.data
      } catch (error) {
        alert('팀 목록을 불러오는데 실패했습니다.')
      }
    },

    /**
     * 팀 모달 열기
     * team이 null이면 등록 모달, 아니면 수정 모달이에요.
     */
    openTeamModal(team) {
      this.editingTeam = team
      if (team) {
        // 수정 모달: 기존 데이터 채우기
        this.teamForm = {
          teamName: team.teamName,
          lunchPrice: team.lunchPrice,
          dinnerPrice: team.dinnerPrice
        }
      } else {
        // 등록 모달: 빈 폼
        this.teamForm = { teamName: '', lunchPrice: '', dinnerPrice: '' }
      }
      this.showTeamModal = true
    },

    // 팀 모달 닫기
    closeTeamModal() {
      this.showTeamModal = false
      this.editingTeam = null
    },

    /**
     * 팀 저장 (등록 or 수정)
     * editingTeam이 있으면 수정, 없으면 등록이에요.
     */
    async saveTeam() {
      if (!this.teamForm.teamName) {
        alert('팀명을 입력해주세요.')
        return
      }
      try {
        if (this.editingTeam) {
          // 수정: PUT /api/companies/{companyId}/teams/{id}
          await api.put(
              `/api/companies/${this.selectedCompany.id}/teams/${this.editingTeam.id}`,
              this.teamForm
          )
          alert('팀 정보가 수정되었습니다.')
        } else {
          // 등록: POST /api/companies/{companyId}/teams
          await api.post(
              `/api/companies/${this.selectedCompany.id}/teams`,
              this.teamForm
          )
          alert('팀이 등록되었습니다.')
        }
        // 저장 후 팀 목록 새로고침
        await this.loadTeams(this.selectedCompany.id)
        this.closeTeamModal()
      } catch (error) {
        alert('저장에 실패했습니다.')
      }
    }
  }
}
</script>

<style scoped>
.setting-container {
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  color: #333;
}

.section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  color: #333;
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

.btn-add {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-add:hover { background: #357abd; }

.btn-edit {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  margin-right: 6px;
}

.btn-team {
  background: #e8f4fd;
  color: #4a90e2;
  border: 1px solid #4a90e2;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #4a90e2;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save:hover { background: #357abd; }

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
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

.btn-home:hover {
  background: #e0e0e0;
}

/* PC 화면에서는 모바일 카드 숨기기 */
.mobile-list {
  display: none;
}

/* 모바일 화면 대응 (768px 이하) */
@media (max-width: 768px) {

  .setting-container {
    padding: 16px;
  }

  .section {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .section-header h3 {
    font-size: 16px;
  }

  .btn-add {
    width: 100%;
    text-align: center;
  }

  /* 모바일에서 테이블 숨기기 */
  .table {
    display: none;
  }

  /* 모바일 카드 목록 보이기 */
  .mobile-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mobile-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mobile-card-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mobile-card-name {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }

  .mobile-card-sub {
    font-size: 12px;
    color: #888;
  }

  .mobile-card-buttons {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  /* 모달 너비 조정 */
  .modal {
    width: 90%;
    padding: 20px;
  }
}
</style>