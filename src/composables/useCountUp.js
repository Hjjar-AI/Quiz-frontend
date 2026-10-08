import { ref, watch, onMounted, onBeforeUnmount, nextTick, toValue } from 'vue'

export function useCountUp(target, duration = 1000, animate = true) {
  const displayValue = ref(0)
  let animationFrame = null
  let generation = 0
  let hasStarted = false
  let disposed = false
  let motionQuery = null

  function stop() {
    generation += 1
    if (animationFrame !== null) cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  function apply(rawTarget) {
    stop()
    const endValue = Number(rawTarget)
    if (!Number.isFinite(endValue)) {
      displayValue.value = 0
      return
    }
    const milliseconds = Number(toValue(duration))
    if (!toValue(animate) || motionQuery?.matches || !Number.isFinite(milliseconds) || milliseconds <= 0) {
      displayValue.value = endValue
      return
    }
    const startValue = displayValue.value
    if (startValue === endValue) return
    const run = generation
    let startTime = null

    function step(timestamp) {
      if (disposed || run !== generation) return
      if (!Number.isFinite(timestamp)) {
        displayValue.value = endValue
        animationFrame = null
        return
      }
      // Both elapsed-time samples come from RAF's clock. Clamp both ends
      // so a backward/late timestamp cannot produce an oversized value.
      if (startTime === null) startTime = timestamp
      const progress = Math.max(0, Math.min((timestamp - startTime) / milliseconds, 1))
      const eased = 1 - (1 - progress) ** 3
      const value = startValue * (1 - eased) + endValue * eased
      displayValue.value = progress === 1 ? endValue
        : Math.max(Math.min(startValue, endValue), Math.min(Math.max(startValue, endValue), value))
      animationFrame = progress < 1 ? requestAnimationFrame(step) : null
    }
    animationFrame = requestAnimationFrame(step)
  }

  watch(() => toValue(target), value => {
    if (hasStarted && !disposed) apply(value)
  })
  function handleMotionChange() {
    if (motionQuery.matches) {
      stop()
      const value = Number(toValue(target))
      displayValue.value = Number.isFinite(value) ? value : 0
    }
  }
  onMounted(() => {
    motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') || null
    motionQuery?.addEventListener?.('change', handleMotionChange)
    nextTick(() => {
      if (disposed) return
      hasStarted = true
      apply(toValue(target))
    })
  })
  onBeforeUnmount(() => {
    disposed = true
    stop()
    motionQuery?.removeEventListener?.('change', handleMotionChange)
  })
  return { displayValue }
}
