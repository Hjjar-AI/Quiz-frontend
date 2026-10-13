import { computed, ref, toValue, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/** Announce crossed milestones, never every ticking second. */
export function useCountdownAnnouncements({ remaining, total, sessionKey, announceTimeUp = true }) {
  const { t } = useI18n()
  const announcementKey = ref('')
  let previous = null
  let identity = null
  const spoken = new Set()

  watch([() => toValue(remaining), () => toValue(total), () => toValue(sessionKey)], ([seconds, duration, key]) => {
    if (!Number.isFinite(seconds) || !Number.isFinite(duration) || duration <= 0) return
    const nextIdentity = `${key}:${duration}`
    if (identity !== nextIdentity) {
      identity = nextIdentity
      previous = null
      spoken.clear()
      announcementKey.value = ''
    }
    const milestones = [
      [duration / 2, 'a11y.halfTime'],
      [300, 'a11y.fiveMinutes'],
      [60, 'a11y.oneMinute'],
      [0, 'a11y.timeLimitReached'],
    ].filter(([threshold]) => threshold < duration)
      .sort((a, b) => b[0] - a[0])

    let latest = ''
    for (const [threshold, message] of milestones) {
      if (seconds > threshold || spoken.has(message)) continue
      spoken.add(message)
      // On resume, do not replay milestones already passed.
      if (previous !== null && previous > threshold) latest = message
    }
    previous = seconds
    if (latest && (latest !== 'a11y.timeLimitReached' || toValue(announceTimeUp))) {
      announcementKey.value = latest
    }
  }, { immediate: true })

  const status = computed(() => {
    const seconds = toValue(remaining)
    const duration = toValue(total)
    if (seconds == null || !duration) return ''
    if (seconds <= 0) return t('a11y.timeLimitReached')
    if (seconds / duration <= 0.1) return t('a11y.timerCritical')
    if (seconds / duration <= 0.2) return t('a11y.timerWarning')
    return ''
  })
  const announcement = computed(() => announcementKey.value ? t(announcementKey.value) : '')
  return { announcement, status }
}
