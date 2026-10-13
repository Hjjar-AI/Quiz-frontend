import { ref } from 'vue'
import { storageService } from '@/services/storageService'
import { DEFAULT_FONT, FONT_OPTIONS, normalizeFontPreference, fontFamiliesFor, fontQueryFor } from '@/constants/fonts'

const STORAGE_KEY = 'pref_font'
const fontPreference = ref(DEFAULT_FONT)
const stylesheets = new Map()
let localeListenerAttached = false

function registerFont(family) {
  if (stylesheets.has(family)) return
  // Only register the selected family. The browser fetches its font files
  // when rendered text needs them; never preload or call FontFace.load().
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.dataset.appFont = family
  const query = new URLSearchParams({ family: fontQueryFor(family), display: 'swap' })
  link.href = `https://fonts.googleapis.com/css2?${query}`
  link.onerror = () => {
    // Keep readable device fallbacks, with no request to /fonts/. Allow
    // a later selection to retry without retaining a failed stylesheet.
    link.remove()
    stylesheets.delete(family)
  }
  stylesheets.set(family, link)
  document.head.appendChild(link)
}

function applyFontToDocument() {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-font', fontPreference.value)
  for (const family of fontFamiliesFor(fontPreference.value, root.dataset.locale)) registerFont(family)
}

function applyFont(value) {
  const preference = normalizeFontPreference(value)
  fontPreference.value = preference
  storageService.setItem(STORAGE_KEY, preference)
  applyFontToDocument()
}

export function loadSavedFont() {
  const saved = storageService.getItem(STORAGE_KEY)
  fontPreference.value = normalizeFontPreference(saved)
  applyFontToDocument()
  if (saved && saved !== fontPreference.value) storageService.setItem(STORAGE_KEY, fontPreference.value)
  if (!localeListenerAttached && typeof window !== 'undefined') {
    window.addEventListener('app:locale-changed', applyFontToDocument)
    localeListenerAttached = true
  }
}

export function useFont() {
  return { fontPreference, applyFont, FONT_OPTIONS }
}
