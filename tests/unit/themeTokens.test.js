import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DARK_THEMES, THEMES } from '@/utils/constants'

const projectRoot = process.env.INIT_CWD || process.cwd()
const tokenSource = readFileSync(resolve(projectRoot, 'src/assets/tokens.css'), 'utf8')

const rules = [...tokenSource.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
  selector: match[1],
  declarations: Object.fromEntries(
    [...match[2].matchAll(/--([\w-]+):\s*([^;]+);/g)].map((declaration) => [
      declaration[1],
      declaration[2].trim(),
    ]),
  ),
}))

function selectsTheme(selector, theme) {
  return (
    selector.includes(`[data-theme="${theme}"]`) || selector.includes(`[data-theme='${theme}']`)
  )
}

const baseTokens = rules.find((rule) => selectsTheme(rule.selector, 'stone')).declarations
const semanticNames = ['primary', 'success', 'danger', 'warning', 'info']
const surfaceNames = ['bg-body', 'bg-card', 'bg-alt']
const textNames = ['text-primary', 'text-secondary', 'text-muted']

function tokensFor(theme) {
  const tokens = { ...baseTokens }
  for (const rule of rules) {
    if (selectsTheme(rule.selector, theme) && rule.declarations !== baseTokens) {
      Object.assign(tokens, rule.declarations)
    }
  }
  return tokens
}

function resolveToken(tokens, name, trail = []) {
  const value = tokens[name]
  if (!value) throw new Error(`Missing --${name}`)
  const reference = value.match(/^var\(--([\w-]+)\)$/)
  if (!reference) return value
  if (trail.includes(name))
    throw new Error(`Circular token reference: ${[...trail, name].join(' -> ')}`)
  return resolveToken(tokens, reference[1], [...trail, name])
}

function rgb(hex) {
  expect(hex).toMatch(/^#[\da-f]{6}$/i)
  const integer = Number.parseInt(hex.slice(1), 16)
  return [(integer >> 16) & 255, (integer >> 8) & 255, integer & 255].map((value) => value / 255)
}

function mix(first, second, firstWeight) {
  const a = rgb(first)
  const b = rgb(second)
  return a.map((value, index) => value * firstWeight + b[index] * (1 - firstWeight))
}

function luminance(color) {
  const channels = Array.isArray(color) ? color : rgb(color)
  return channels
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
}

function contrast(first, second) {
  const a = luminance(first)
  const b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function oklab(color) {
  const [r, g, b] = rgb(color).map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  )
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function colorDistance(first, second) {
  const a = oklab(first)
  const b = oklab(second)
  return Math.hypot(...a.map((value, index) => value - b[index])) * 100
}

describe('theme token accessibility', () => {
  for (const theme of THEMES) {
    it(`${theme} keeps text, controls, and semantic states legible`, () => {
      const tokens = tokensFor(theme)
      const surfaces = surfaceNames.map((name) => resolveToken(tokens, `color-${name}`))
      const isDark = DARK_THEMES.includes(theme)

      for (const textName of textNames) {
        const text = resolveToken(tokens, `color-${textName}`)
        for (const surface of surfaces) expect(contrast(text, surface)).toBeGreaterThanOrEqual(4.5)
      }

      const muted = resolveToken(tokens, 'color-text-muted')
      for (const surface of surfaces) {
        expect(contrast(mix(muted, surface, 0.96), surface)).toBeGreaterThanOrEqual(4.5)
      }
      const card = resolveToken(tokens, 'color-bg-card')
      expect(contrast(mix(muted, card, 0.72), card)).toBeGreaterThanOrEqual(3)

      for (const semantic of semanticNames) {
        const seed = resolveToken(tokens, `color-${semantic}`)
        const onColor = resolveToken(tokens, `color-on-${semantic}`)
        const solidTarget = theme === 'contrast' ? 7 : 4.5
        expect(contrast(seed, onColor)).toBeGreaterThanOrEqual(solidTarget)

        for (const surface of surfaces) {
          const softBackground = mix(seed, surface, 0.15)
          const softText = isDark ? seed : mix(seed, '#000000', 0.7)
          expect(contrast(softText, softBackground)).toBeGreaterThanOrEqual(4.5)
        }
      }
    })

    it(`${theme} keeps semantic and chart series colors distinguishable`, () => {
      const tokens = tokensFor(theme)
      const semantics = semanticNames.map((name) => resolveToken(tokens, `color-${name}`))
      const chartSeries = Array.from({ length: 6 }, (_, index) =>
        resolveToken(tokens, `color-chart-${index + 1}`),
      )

      for (const colors of [semantics, chartSeries]) {
        for (let first = 0; first < colors.length; first += 1) {
          for (let second = first + 1; second < colors.length; second += 1) {
            const minimum = colors === chartSeries ? 7 : 5
            expect(colorDistance(colors[first], colors[second])).toBeGreaterThanOrEqual(minimum)
          }
        }
      }
    })
  }
})
