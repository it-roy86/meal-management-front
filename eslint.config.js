import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

/**
 * ESLint 설정 (flat config)
 * - `flat/essential`만 적용해요 — Vue 템플릿에서 실제 버그로 이어질 수 있는
 *   규칙(v-for에 key 누락, computed에서 상태 변경 등)만 검사해요.
 * - `flat/recommended`는 들여쓰기/줄바꿈 같은 포맷팅 규칙까지 포함하는데,
 *   기존 코드 전체를 포맷터로 갈아엎는 건 이번 범위가 아니라서 제외했어요.
 *   (포맷팅 통일이 필요해지면 그때 Prettier + strongly-recommended 도입 고려)
 */
export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**']
  }
]
