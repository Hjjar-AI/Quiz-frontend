// Existing project text fonts. This preference is local to the browser.
export const DEFAULT_FONT = 'default'
export const FONT_OPTIONS = ['default', 'system', 'noto-arabic', 'inter', 'outfit']

const FONT_FAMILIES = {
  'noto-arabic': 'Noto Sans Arabic',
  inter: 'Inter',
  outfit: 'Outfit',
}

export function normalizeFontPreference(value) {
  return FONT_OPTIONS.includes(value) ? value : DEFAULT_FONT
}

export function fontFamiliesFor(value, locale) {
  const preference = normalizeFontPreference(value)
  if (preference === 'system') return []
  if (preference === DEFAULT_FONT) {
    return [locale === 'en' ? 'Inter' : 'Noto Sans Arabic', 'Outfit']
  }
  return [FONT_FAMILIES[preference]]
}
