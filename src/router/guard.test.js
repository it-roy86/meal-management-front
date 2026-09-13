import { describe, expect, it } from 'vitest'
import { HOME_BY_ROLE, resolveRouteGuard } from './guard'

describe('resolveRouteGuard', () => {
    it('공개 라우트(meta.public)는 role 상관없이 통과시켜요', () => {
        expect(resolveRouteGuard({ public: true }, null)).toBe(true)
        expect(resolveRouteGuard({ public: true }, 'ADMIN')).toBe(true)
    })

    it('로그인 안 한 상태(role 없음)로 보호된 라우트에 가면 로그인 화면으로 보내요', () => {
        expect(resolveRouteGuard({ roles: ['ADMIN'] }, null)).toBe('/')
    })

    it('role이 허용 목록에 있으면 통과시켜요', () => {
        expect(resolveRouteGuard({ roles: ['ADMIN', 'OPERATOR'] }, 'OPERATOR')).toBe(true)
    })

    it('role이 허용 목록에 없으면 그 role의 기본 화면으로 보내요', () => {
        expect(resolveRouteGuard({ roles: ['ADMIN'] }, 'VIEWER')).toBe(HOME_BY_ROLE.VIEWER)
        expect(resolveRouteGuard({ roles: ['ADMIN'] }, 'OPERATOR')).toBe(HOME_BY_ROLE.OPERATOR)
    })

    it('meta.roles가 없는 라우트는(공개도 아니지만) 로그인만 되어 있으면 통과시켜요', () => {
        expect(resolveRouteGuard({}, 'ADMIN')).toBe(true)
    })

    it('HOME_BY_ROLE에 없는 미확인 role이면 로그인 화면으로 보내요', () => {
        expect(resolveRouteGuard({ roles: ['ADMIN'] }, 'UNKNOWN')).toBe('/')
    })
})
