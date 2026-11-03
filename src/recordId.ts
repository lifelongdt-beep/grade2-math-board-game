/** 교실의 HTTP 주소에서도 작동합니다(randomUUID는 보안 연결에서만 제공될 수 있습니다). */
export const newRecordId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
