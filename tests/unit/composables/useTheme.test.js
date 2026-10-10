// frontend/tests/unit/composables/useTheme.test.js
//
// i18n note: `useTheme.applyTheme` calls `i18n.global.t(...)` to
// announce the theme change via the a11y live region. The i18n
// singleton is initialized by `@/i18n` when the module is imported,
// and the test does not need to install the plugin on a Vue app.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTheme, applyTheme, loadSavedTheme } from '@/composables/useTheme'
import { storageService } from '@/services/storageService'

let prefersDark = false
let systemThemeListener = null

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  prefersDark = false
  document.documentElement.style.setProperty('--motion-theme-duration', '350ms')
  window.matchMedia = vi.fn((query) => ({
    matches: query === '(prefers-color-scheme: dark)' && prefersDark,
    addEventListener: vi.fn((_event, listener) => {
      systemThemeListener = listener
    }),
  }))
  // Reset the DOM to a known baseline. `loadSavedTheme` with an
  // empty storage defaults `currentTheme` to Iris and writes it on
  // the html element.
  loadSavedTheme()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useTheme — applyTheme', () => {
  it('updates currentTheme and the data-theme attribute', () => {
    const { currentTheme } = useTheme()
    applyTheme('dark')
    expect(currentTheme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('persists the choice to localStorage', () => {
    applyTheme('blossom')
    expect(storageService.getItem('theme')).toBe('blossom')
  })

  it('falls back to Iris for an unknown theme', () => {
    const { currentTheme } = useTheme()
    applyTheme('not-a-real-theme')
    expect(currentTheme.value).toBe('iris')
  })

  it('resolves Auto from the system preference while persisting Auto', () => {
    prefersDark = true
    const { currentTheme, themePreference } = useTheme()
    applyTheme('auto')
    expect(themePreference.value).toBe('auto')
    expect(currentTheme.value).toBe('midnight')
    expect(storageService.getItem('theme')).toBe('auto')
  })

  it('follows system preference changes while Auto is selected', () => {
    const { currentTheme } = useTheme()
    applyTheme('auto')
    systemThemeListener({ matches: true })
    expect(currentTheme.value).toBe('midnight')
    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight')
  })

  it('adds then removes the theme-transition class', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('theme-transition')).toBe(true)
    vi.advanceTimersByTime(350)
    expect(document.documentElement.classList.contains('theme-transition')).toBe(false)
  })

  it('is a no-op when applying the current theme again', () => {
    applyTheme('dark')
    document.documentElement.classList.remove('theme-transition')
    applyTheme('dark')
    // The transition class is not re-added when the theme did not
    // change.
    expect(document.documentElement.classList.contains('theme-transition')).toBe(false)
  })
})

describe('useTheme — loadSavedTheme', () => {
  it('migrates the retired Fresh theme to Lagoon', () => {
    storageService.setItem('theme', 'fresh')
    const { currentTheme, themePreference } = useTheme()
    loadSavedTheme()
    expect(themePreference.value).toBe('lagoon')
    expect(currentTheme.value).toBe('lagoon')
    expect(document.documentElement.getAttribute('data-theme')).toBe('lagoon')
    expect(storageService.getItem('theme')).toBe('lagoon')
  })

  it('falls back to Iris when the stored value is not a known theme', () => {
    storageService.setItem('theme', 'pink')
    const { currentTheme } = useTheme()
    loadSavedTheme()
    expect(currentTheme.value).toBe('iris')
  })

  it('falls back to Iris when storage is empty', () => {
    const { currentTheme } = useTheme()
    loadSavedTheme()
    expect(currentTheme.value).toBe('iris')
  })
})

describe('useTheme — getters', () => {
  it('isDark tracks every dark palette', () => {
    const { isDark } = useTheme()
    applyTheme('dark')
    expect(isDark.value).toBe(true)
    applyTheme('midnight')
    expect(isDark.value).toBe(true)
    applyTheme('onyx')
    expect(isDark.value).toBe(true)
    applyTheme('light')
    expect(isDark.value).toBe(false)
    applyTheme('lagoon')
    expect(isDark.value).toBe(false)
  })

  it('THEMES exposes every supported theme', () => {
    const { THEMES } = useTheme()
    expect([...THEMES].sort()).toEqual(
      [
        'amber',
        'blossom',
        'contrast',
        'ruby',
        'dark',
        'ink',
        'iris',
        'lagoon',
        'midnight',
        'onyx',
        'slate',
        'stone',
      ].sort(),
    )
  })
})
