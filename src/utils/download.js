/**
 * 파일 다운로드 유틸
 * 백엔드가 내려주는 파일(엑셀 등)을 브라우저에서 저장할 때 써요.
 */

/**
 * Content-Disposition 헤더에서 파일명을 꺼내요.
 * 한글 파일명은 백엔드가 filename*=UTF-8''... (RFC 5987) 형식으로 인코딩해서 보내므로
 * 그걸 우선 사용하고, 없으면 filename="..."을, 둘 다 없으면 fallback을 써요.
 *
 * @param {string|undefined} contentDisposition 응답 헤더 값
 * @param {string} fallback 헤더에서 파일명을 못 찾았을 때 쓸 이름
 * @returns {string}
 */
export function parseFilename(contentDisposition, fallback) {
    if (!contentDisposition) {
        return fallback
    }

    const encoded = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
    if (encoded) {
        try {
            return decodeURIComponent(encoded[1].trim())
        } catch {
            // 잘못 인코딩된 값이면 아래 filename="..."으로 넘어가요
        }
    }

    const plain = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i)
    if (plain) {
        return plain[1].trim()
    }

    return fallback
}

/**
 * Blob을 파일로 저장해요 (임시 링크를 만들어 클릭시키는 방식).
 *
 * @param {Blob} blob 저장할 데이터
 * @param {string} filename 저장할 파일명
 */
export function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}
