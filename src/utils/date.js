/**
 * 날짜 → 문자열 변환 유틸
 *
 * Date.toISOString()은 UTC 기준이라 한국 시간(UTC+9)에서는 날짜가 하루 밀려요.
 * 예) 한국 시간 9/1 00:00 → toISOString() = "2026-08-31T15:00:00.000Z"
 * 그래서 화면 기본 날짜값은 반드시 이 파일의 함수(로컬 시간 기준)로 만들어야 해요.
 */

const pad = (n) => String(n).padStart(2, '0')

/**
 * 로컬 시간 기준 yyyy-MM-dd (input[type=date] 값 형식)
 */
export function formatDate(date = new Date()) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * 로컬 시간 기준 yyyy-MM (input[type=month] 값 형식)
 */
export function formatYearMonth(date = new Date()) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

/**
 * 해당 날짜가 속한 달의 1일 (yyyy-MM-dd)
 */
export function firstDayOfMonth(date = new Date()) {
    return formatDate(new Date(date.getFullYear(), date.getMonth(), 1))
}
