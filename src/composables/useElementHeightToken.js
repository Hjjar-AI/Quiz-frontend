import { watch, onBeforeUnmount } from 'vue'

/** Keep viewport offsets aligned with a surface that can resize or disappear. */
export function useElementHeightToken(elementRef, token) {
  let observer = null
  let measuredElement = null
  let writtenValue = null

  function clear() {
    observer?.disconnect()
    observer = null
    measuredElement = null
    const style = document.documentElement.style
    if (writtenValue !== null && style.getPropertyValue(token) === writtenValue) {
      style.removeProperty(token)
    }
    writtenValue = null
  }

  function measure() {
    if (!measuredElement) return
    const height = measuredElement.getBoundingClientRect().height
    if (!Number.isFinite(height)) return
    writtenValue = `${height}px`
    document.documentElement.style.setProperty(token, writtenValue)
  }

  const stop = watch(elementRef, (element) => {
    clear()
    if (!element) return
    measuredElement = element
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      observer.observe(element)
    }
  }, { flush: 'post' })

  window.addEventListener('resize', measure, { passive: true })
  onBeforeUnmount(() => {
    stop()
    clear()
    window.removeEventListener('resize', measure)
  })
}
