// Theme preference, resolved palette, and browser-chrome coordination.
//
// `themePreference` is what the user selected and what localStorage keeps.
// `currentTheme` is the concrete palette applied to <html>. They differ only
// for the Auto preference, which resolves to Stone or Midnight from the OS
// color-scheme preference. index.html mirrors this resolution before paint.

import { computed, ref } from 'vue'
import { i18n } from '@/i18n'
import {
  AUTO_THEME,
  DARK_THEMES,
  DEFAULT_THEME,
  THEME_GROUPS,
  THEME_OPTIONS,
  THEMES,
  normalizeThemePreference,
  resolveTheme,
} from '@/utils/constants'
import { storageService } from '@/services/storageService'

const currentTheme = ref(DEFAULT_THEME)
const themePreference = ref(DEFAULT_THEME)
let systemThemeQuery = null
let systemThemeListenerAttached = false
let themeTransitionTimer = null

function translateTheme(theme) {
  return i18n.global.t(`theme.${theme}`)
}

function announceTheme(theme) {
  const announcer = document.getElementById('a11y-announcer')
  if (announcer) {
    announcer.textContent = i18n.global.t('theme.changed', {
      theme: translateTheme(theme),
    })
  }
}

function prefersDarkTheme() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function updateBrowserChrome() {
  if (typeof document === 'undefined') return
  const meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) return
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-bg-body')
    .trim()
  if (color) meta.setAttribute('content', color)
}

function writeResolvedTheme(theme, withTransition = false) {
  if (typeof document === 'undefined') return
  clearTimeout(themeTransitionTimer)
  themeTransitionTimer = null
  document.documentElement.classList.remove('theme-transition')
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const duration = getComputedStyle(document.documentElement)
    .getPropertyValue('--motion-theme-duration').trim().match(/^(\d*\.?\d+)(ms|s)$/)
  const durationMs = duration ? Number(duration[1]) * (duration[2] === 's' ? 1000 : 1) : 0
  const animate = withTransition && !reducedMotion && durationMs > 0
  if (animate) document.documentElement.classList.add('theme-transition')
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
  updateBrowserChrome()

  if (animate) {
    themeTransitionTimer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
      themeTransitionTimer = null
    }, durationMs)
  }
}

function handleSystemThemeChange(event) {
  if (themePreference.value !== AUTO_THEME) return
  const resolved = resolveTheme(AUTO_THEME, event.matches)
  if (resolved !== currentTheme.value) writeResolvedTheme(resolved, true)
}

function ensureSystemThemeListener() {
  if (
    systemThemeListenerAttached ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return
  }

  systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemThemeQuery.addEventListener?.('change', handleSystemThemeChange)
  systemThemeListenerAttached = true
}

export function applyTheme(theme) {
  const preference = normalizeThemePreference(theme)
  const resolved = resolveTheme(preference, prefersDarkTheme())
  const preferenceChanged = themePreference.value !== preference
  const themeChanged = currentTheme.value !== resolved
  if (!preferenceChanged && !themeChanged) return

  themePreference.value = preference
  if (themeChanged) writeResolvedTheme(resolved, true)
  storageService.setItem('theme', preference)
  announceTheme(preference)
}

export function getThemeLabel(theme) {
  return translateTheme(theme)
}

export function loadSavedTheme() {
  const saved = storageService.getItem('theme')
  const preference = saved ? normalizeThemePreference(saved) : DEFAULT_THEME
  const resolved = resolveTheme(preference, prefersDarkTheme())

  themePreference.value = preference
  writeResolvedTheme(resolved)
  ensureSystemThemeListener()

  // Persist canonical names when migrating aliases or recovering from an
  // unknown stored value. Empty storage remains empty until a user choice.
  if (saved && saved !== preference) storageService.setItem('theme', preference)
}

export function useTheme() {
  const isDark = computed(() => DARK_THEMES.includes(currentTheme.value))

  return {
    currentTheme,
    themePreference,
    isDark,
    applyTheme,
    getThemeLabel,
    loadSavedTheme,
    THEMES,
    THEME_OPTIONS,
    THEME_GROUPS,
  }
}
