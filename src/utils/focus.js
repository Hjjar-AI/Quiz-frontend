const FOCUS_TARGETS = [
  'button', 'a[href]', 'input', 'select', 'textarea',
  '[tabindex]', '[contenteditable="true"]',
].join(', ')

export function isFocusableElement(element, allowNegativeTabIndex = false) {
  if (!element?.isConnected || typeof element.focus !== 'function') return false
  if (!element.matches(FOCUS_TARGETS)) return false
  if (element.matches(':disabled, input[type="hidden"]')) return false
  if (!allowNegativeTabIndex && element.tabIndex < 0) return false
  for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.matches('[hidden], [inert], [aria-hidden="true"]')) return false
    const style = getComputedStyle(ancestor)
    if (style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility)) return false
  }
  return element.getClientRects().length > 0
}

export function getFocusableElements(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUS_TARGETS)).filter(
    element => isFocusableElement(element),
  )
}
