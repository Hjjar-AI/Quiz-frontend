<!-- frontend/src/components/common/ToastContainer.vue -->
<template>
  <div
    class="toast-container no-print"
    :aria-label="t('a11y.notifications')"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
        aria-atomic="true"
        @mouseenter="toastStore.pauseToast(toast.id, 'hover')"
        @mouseleave="toastStore.resumeToast(toast.id, 'hover')"
        @focusin="toastStore.pauseToast(toast.id, 'focus')"
        @focusout="onFocusOut($event, toast.id)"
      >
        <i class="toast__icon" :class="getToastIcon(toast.type)" aria-hidden="true"></i>
        <span class="toast__message">{{ toast.message }}</span>
        <BaseIconButton
          class="toast__close"
          icon="bi bi-x-lg"
          size="small"
          :label="t('a11y.closeNotification')"
          @click="toastStore.removeToast(toast.id)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toastStore'
import BaseIconButton from '@/components/base/BaseIconButton.vue'

const { t } = useI18n()
const toastStore = useToastStore()

function onFocusOut(event, id) {
  if (!event.currentTarget.contains(event.relatedTarget)) toastStore.resumeToast(id, 'focus')
}

function getToastIcon(type) {
  const icons = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-exclamation-circle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    info: 'bi bi-info-circle-fill',
  }
  return icons[type] || icons.info
}
</script>
