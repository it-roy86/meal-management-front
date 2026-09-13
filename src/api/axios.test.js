// @vitest-environment jsdom
//
// localStorage/window.location을 써야 해서 이 파일만 jsdom 환경으로 돌려요
// (router/guard.test.js는 DOM이 필요 없어서 기본 node 환경 그대로 씀).

import { beforeEach, describe, expect, it } from 'vitest'
import api, { handleAuthError } from './axios'

describe('axios 인스턴스 설정', () => {
    it('쿠키 기반 인증에 필요한 설정이 켜져 있어요 (httpOnly 쿠키 + CSRF)', () => {
        // JWT는 httpOnly 쿠키로 관리되므로 withCredentials가 꺼지면 로그인 자체가 깨져요.
        expect(api.defaults.withCredentials).toBe(true)
        // CSRF 토큰(XSRF-TOKEN 쿠키)을 헤더로 자동으로 실어 보내기 위한 설정이에요.
        expect(api.defaults.withXSRFToken).toBe(true)
    })
})

describe('handleAuthError', () => {
    beforeEach(() => {
        localStorage.setItem('role', 'ADMIN')
        localStorage.setItem('username', 'admin')

        // jsdom의 실제 location.href 대입은 "Not implemented: navigation" 에러를
        // 콘솔에 찍어서, 테스트에서 다루기 쉬운 평범한 객체로 바꿔치기해요.
        delete window.location
        window.location = { href: '' }
    })

    it('401 응답이면 role/username을 지우고 로그인 화면으로 보내요', async () => {
        const error = { response: { status: 401 } }

        await expect(handleAuthError(error)).rejects.toBe(error)

        expect(localStorage.getItem('role')).toBeNull()
        expect(localStorage.getItem('username')).toBeNull()
        expect(window.location.href).toBe('/')
    })

    it('401이 아닌 응답(예: 403)이면 로그인 정보를 건드리지 않아요', async () => {
        const error = { response: { status: 403 } }

        await expect(handleAuthError(error)).rejects.toBe(error)

        expect(localStorage.getItem('role')).toBe('ADMIN')
        expect(localStorage.getItem('username')).toBe('admin')
        expect(window.location.href).toBe('')
    })

    it('응답 자체가 없는 네트워크 오류도 그대로 두고 reject만 해요', async () => {
        const error = { message: 'Network Error' } // error.response가 없는 경우

        await expect(handleAuthError(error)).rejects.toBe(error)

        expect(localStorage.getItem('role')).toBe('ADMIN')
        expect(window.location.href).toBe('')
    })
})
