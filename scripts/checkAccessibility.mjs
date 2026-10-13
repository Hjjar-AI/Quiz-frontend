import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Deliberately scans production styles only. No build or test-suite dependency.
const styles = fileURLToPath(new URL('../src/assets/', import.meta.url))
const failures = []
let count = 0
for (const name of await readdir(styles)) {
  if (!name.endsWith('.css')) continue
  count++
  const source = await readFile(`${styles}/${name}`, 'utf8')
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, selector, body] = match
    const declarations = body.replace(/\/\*[\s\S]*?\*\//g, '')
    const line = source.slice(0, match.index).split('\n').length
    for (const size of declarations.matchAll(/(?:^|;)\s*font-size:\s*([\d.]+)(rem|px)\s*(?:;|$)/g)) {
      if (Number(size[1]) < (size[2] === 'rem' ? 0.75 : 12)) failures.push(`${name}:${line}: text below the shared 0.75rem/12px floor`)
    }
    const removesOutline = /(?:^|;)\s*outline:\s*(?:none|0)\s*(?:!important)?\s*(?:;|$)/.test(declarations)
    const replacement = /box-shadow:\s*(?!none)[^;]+/.test(declarations)
    const owner = /a11y-focus-owner:\s*\S+/.test(body)
    // Hover-only visual resets do not suppress a keyboard focus indicator.
    if (removesOutline && !replacement && !owner && !selector.includes(':hover')) {
      failures.push(`${name}:${line}: outline removed without a replacement or documented focus owner`)
    }
  }
}
const tokens = await readFile(`${styles}/tokens.css`, 'utf8')
if (!/--font-size-xs:\s*0\.75rem\s*;/.test(tokens)) failures.push('tokens.css: preserve the shared minimum text size')
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Accessibility style guardrails passed (${count} production stylesheets).`)
}
