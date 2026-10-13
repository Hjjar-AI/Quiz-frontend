// frontend/src/composables/useNotify.js
import { useToastStore } from '@/stores/toastStore'

export function useNotify() {
  const toastStore = useToastStore()

  function notify(message, type = 'info', duration) {
    return toastStore.addToast(message, type, duration)
  }

  return { notify }
}