import { onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useDialog } from '@/composables/useDialog'
import { useNotify } from '@/composables/useNotify'
import { i18n } from '@/i18n'

/** Saved sessions can resume, but drafts and pending requests need protection. */
export function useSessionLeaveGuard({ active, busy, beforeLeave = () => {} }) {
  const { confirm } = useDialog()
  const { notify } = useNotify()
  let pendingConfirmation = null

  async function canLeave() {
    if (!active()) return true
    if (busy()) {
      notify(i18n.global.t('tests.waitForSave'), 'info')
      return false
    }
    if (!pendingConfirmation) {
      pendingConfirmation = confirm(i18n.global.t('tests.leaveConfirm'), 'warning')
        .finally(() => { pendingConfirmation = null })
    }
    const approved = await pendingConfirmation
    if (approved && !busy()) beforeLeave()
    return approved && !busy()
  }

  function beforeUnload(event) {
    if (!active()) return
    event.preventDefault()
    event.returnValue = ''
  }

  onBeforeRouteLeave(canLeave)
  onBeforeRouteUpdate((to, from) => to.path === from.path ? true : canLeave())
  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
}
