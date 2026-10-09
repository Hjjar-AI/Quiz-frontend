/** Public connection convenience; decorative IDs are never proof of server identity. */
export function normalizeServerAddress(input) {
  const value = String(input ?? '').trim()
  if (!value || value.length > 2048 || /[\s\u0000-\u001f\u007f-\u009f]/u.test(value) ||
      !/^https?:\/\//i.test(value) || value.includes('?') || value.includes('#')) return null
  try {
    const url = new URL(value)
    if (url.username || url.password) return null
    if (url.pathname === '/') url.pathname = '/api/v1/'
    else if (url.pathname.endsWith('/api/v1')) url.pathname += '/'
    else if (!url.pathname.endsWith('/api/v1/')) return null
    return url.href
  } catch {
    return null
  }
}

export function exportServerConnection(address) {
  const api = normalizeServerAddress(address)
  if (!api) throw new Error('Invalid server address')
  const decorativeId = () => globalThis.crypto?.randomUUID?.() ??
    `decorative-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
  return JSON.stringify({
    format: 'mukhtabir.connection',
    version: 1,
    bundle: {
      identity: decorativeId(),
      connection: { identity: decorativeId(), endpoint: { api } },
      metadata: { identity: decorativeId(), purpose: 'connection convenience' },
    },
  }, null, 2)
}
