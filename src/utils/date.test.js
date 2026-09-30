import { describe, expect, it } from 'vitest'
import { firstDayOfMonth, formatDate, formatYearMonth } from './date'

// 한국 시간(UTC+9)으로 고정해서 테스트해요.
// CI 등 UTC 환경에서 돌리면 toISOString()을 써도 테스트가 통과해버려서 버그를 못 잡기 때문이에요.
process.env.TZ = 'Asia/Seoul'

describe('테스트 환경', () => {
    it('타임존이 한국 시간으로 적용되어 있어요 (toISOString이면 전날로 밀리는 환경)', () => {
        expect(new Date(2026, 8, 1).toISOString().slice(0, 10)).toBe('2026-08-31')
    })
})

describe('formatDate', () => {
    it('로컬 시간 기준 yyyy-MM-dd로 변환해요', () => {
        expect(formatDate(new Date(2026, 8, 30))).toBe('2026-09-30')
    })

    it('자정 직후(0시)에도 전날로 밀리지 않아요 (toISOString 버그 재발 방지)', () => {
        expect(formatDate(new Date(2026, 8, 1, 0, 0, 0))).toBe('2026-09-01')
    })

    it('오전 9시 전에도 오늘 날짜를 돌려줘요', () => {
        expect(formatDate(new Date(2026, 8, 30, 8, 59))).toBe('2026-09-30')
    })

    it('한 자리 월/일은 0을 채워요', () => {
        expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    })
})

describe('formatYearMonth', () => {
    it('로컬 시간 기준 yyyy-MM으로 변환해요 (1일 0시에도 전달로 밀리지 않음)', () => {
        expect(formatYearMonth(new Date(2026, 9, 1, 0, 0))).toBe('2026-10')
    })
})

describe('firstDayOfMonth', () => {
    it('해당 달의 1일을 돌려줘요', () => {
        expect(firstDayOfMonth(new Date(2026, 8, 30))).toBe('2026-09-01')
    })

    it('연초에도 올바르게 동작해요', () => {
        expect(firstDayOfMonth(new Date(2026, 0, 15))).toBe('2026-01-01')
    })
})
