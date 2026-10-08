// Supported text fonts. This preference is local to the browser.
export const DEFAULT_FONT = 'default'
export const FONT_OPTIONS = [
  'default', 'system', 'noto-arabic', 'tajawal', 'cairo', 'ibm-plex-arabic', 'amiri', 'inter', 'outfit',
]

const FONT_FAMILIES = {
  'noto-arabic': 'Noto Sans Arabic',
  tajawal: 'Tajawal',
  cairo: 'Cairo',
  'ibm-plex-arabic': 'IBM Plex Sans Arabic',
  amiri: 'Amiri',
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

// Google Fonts metadata: Cairo is variable; the other additions use
// discrete weights. A universal 100..900 query fails for these families.
const FONT_WEIGHT_QUERIES = {
  'Noto Sans Arabic': '100..900',
  Inter: '100..900',
  Outfit: '100..900',
  Tajawal: '200;300;400;500;700;800;900',
  Cairo: '200..1000',
  'IBM Plex Sans Arabic': '100;200;300;400;500;600;700',
  Amiri: '400;700',
}

export function fontQueryFor(family) {
  return `${family}:wght@${FONT_WEIGHT_QUERIES[family]}`
}
