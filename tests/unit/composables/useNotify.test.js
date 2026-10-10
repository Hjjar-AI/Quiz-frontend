// frontend/tests/unit/composables/useNotify.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useNotify } from '@/composables/useNotify'
import { useToastStore } from '@/stores/toastStore'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  useToastStore().reset()
  vi.useRealTimers()
})

describe('useNotify', () => {
  it('pushes a toast into the toast store', () => {
    const { notify } = useNotify()
    const store = useToastStore()
    notify('Hello', 'info')
    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0].message).toBe('Hello')
    expect(store.toasts[0].type).toBe('info')
  })

  it('defaults the type to info', () => {
    const { notify } = useNotify()
    const store = useToastStore()
    notify('Hello')
    expect(store.toasts[0].type).toBe('info')
  })

  it('uses the default 8000 ms duration for non-error toasts', () => {
    const { notify } = useNotify()
    const store = useToastStore()
    notify('Hello', 'info')
    vi.advanceTimersByTime(7999)
    expect(store.toasts).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(store.toasts).toHaveLength(0)
  })

  it('keeps error toasts until explicitly dismissed', () => {
    const { notify } = useNotify()
    const store = useToastStore()
    notify('Boom', 'error')
    vi.advanceTimersByTime(4000)
    // Errors stay available for review until the user dismisses them.
    expect(store.toasts).toHaveLength(1)
    vi.advanceTimersByTime(60_000)
    expect(store.toasts).toHaveLength(1)
    store.removeToast(store.toasts[0].id)
    expect(store.toasts).toHaveLength(0)
  })

  it('returns the toast id', () => {
    const { notify } = useNotify()
    const id = notify('X', 'success')
    expect(typeof id).toBe('number')
  })
})