import { API_BASE } from '@/services/api/endpoints'
import { i18n } from '@/i18n'

// No question text, images, credentials or profile data enter browser storage.
let key = null
const identity = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function bindPendingQuestionWrites(user) {
  const next = user?.uuid ? `question-write-recovery:${new URL(API_BASE, window.location.origin).href}:${user.uuid}` : null
  const previous = key
  key = next
  if (previous && previous !== next) localStorage.removeItem(previous)
}
export function readPendingQuestionWrites() {
  if (!key) return { create: null, duplicates: {} }
  const raw = JSON.parse(localStorage.getItem(key) || '{}')
  const duplicates = Object.fromEntries(Object.entries(raw.duplicates || {}).filter(([id, operation]) => /^\d+$/.test(id) && identity.test(operation)))
  return { create: identity.test(raw.create || '') ? raw.create : null, duplicates }
}
export function persistPendingQuestionWrites(create, duplicates) {
  if (!key) throw new Error(i18n.global.t('questions.recoveryStorageFailed'))
  try {
    if (!create && !Object.keys(duplicates).length) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify({ create, duplicates }))
  } catch { throw new Error(i18n.global.t('questions.recoveryStorageFailed')) }
}
