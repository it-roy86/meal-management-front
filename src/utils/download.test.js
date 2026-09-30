import { describe, expect, it } from 'vitest'
import { parseFilename } from './download'

describe('parseFilename', () => {
    const fallback = '식대내역.xlsx'

    it('한글 파일명(filename*=UTF-8)을 디코딩해요', () => {
        const header = "attachment; filename*=UTF-8''%EC%8B%9D%EB%8C%80%EB%82%B4%EC%97%AD_2026-09-01_2026-09-30.xlsx"
        expect(parseFilename(header, fallback)).toBe('식대내역_2026-09-01_2026-09-30.xlsx')
    })

    it('filename과 filename*이 같이 오면 filename*(UTF-8)을 우선해요', () => {
        const header = "attachment; filename=\"meal.xlsx\"; filename*=UTF-8''%EC%8B%9D%EB%8C%80.xlsx"
        expect(parseFilename(header, fallback)).toBe('식대.xlsx')
    })

    it('filename="..." 형식도 읽어요', () => {
        expect(parseFilename('attachment; filename="meal.xlsx"', fallback)).toBe('meal.xlsx')
    })

    it('따옴표 없는 filename=... 형식도 읽어요', () => {
        expect(parseFilename('attachment; filename=meal.xlsx', fallback)).toBe('meal.xlsx')
    })

    it('헤더가 없으면 fallback을 돌려줘요', () => {
        expect(parseFilename(undefined, fallback)).toBe(fallback)
        expect(parseFilename('', fallback)).toBe(fallback)
    })

    it('헤더에 파일명이 없으면 fallback을 돌려줘요', () => {
        expect(parseFilename('attachment', fallback)).toBe(fallback)
    })
})
