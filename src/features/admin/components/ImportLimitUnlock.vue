<template>
  <div class="simple-import-tab">
    <p>{{ t('admin.import.unlock.hint') }}</p>
    <FeedbackRegion scope="section" :success="active ? t('admin.import.unlock.active') : ''" :error="error" />
    <BaseInput v-model="password" type="password" autocomplete="current-password" :label="t('admin.import.unlock.password')" :disabled="busy" />
    <div class="simple-import-tab__actions">
      <BaseButton variant="outline" :loading="busy" :disabled="!password" @click="unlock">
        {{ t('admin.import.unlock.button') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FeedbackRegion from '@/components/common/FeedbackRegion.vue'
import { adminService } from '@/services/adminService'
import { sessionGeneration } from '@/services/api/sessionScope'
const { t } = useI18n()
const password = ref('')
const busy = ref(false)
const active = ref(false)
const error = ref('')
let timer
let disposed = false
let owner = sessionGeneration()
const isCurrent = generation => !disposed && generation === sessionGeneration()
function applyStatus(status) {
  clearTimeout(timer)
  active.value = status?.active === true && status.expires_in > 0
  if (active.value) timer = setTimeout(() => { active.value = false }, status.expires_in * 1000)
}
onMounted(async () => {
  const generation = sessionGeneration()
  try {
    const status = await adminService.importLimitStatus()
    if (isCurrent(generation)) applyStatus(status)
  } catch { /* The password action remains usable when the status read fails. */ }
})
onBeforeUnmount(() => { disposed = true; clearTimeout(timer); password.value = '' })
async function unlock() {
  if (busy.value || !password.value || disposed) return
  if (owner !== sessionGeneration()) {
    owner = sessionGeneration()
    password.value = ''
    active.value = false
    clearTimeout(timer)
    return
  }
  const generation = sessionGeneration()
  busy.value = true
  error.value = ''
  try {
    const status = await adminService.unlockImportLimit(password.value)
    if (isCurrent(generation)) applyStatus(status)
  } catch (err) {
    if (!isCurrent(generation)) return
    error.value = err?.message || t('admin.import.failed')
    // Read the session grant after a lost response; never replay the password POST.
    if (!Number.isInteger(err?.code) || err.code >= 500) {
      try {
        const status = await adminService.importLimitStatus()
        if (isCurrent(generation)) {
          applyStatus(status)
          if (status?.active) error.value = ''
        }
      } catch { /* Retain the original failure. */ }
    }
  } finally {
    password.value = ''
    busy.value = false
  }
}
</script>
